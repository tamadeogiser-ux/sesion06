// api.test.js
import http from 'http';
import request from 'supertest';
import { jest } from '@jest/globals';
import { requestHandler } from '../../server.js';

describe('Weather API Integration Suite', () => {
    let server;

    beforeAll(() => {
        // Mockear console.log para no ensuciar output de tests
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });

        // Crear una instancia aislada del servidor
        server = http.createServer(requestHandler);
    });

    afterAll(() => {
        jest.restoreAllMocks();
        // Cerrar servidor si estuviera escuchando (aquí supertest maneja esto)
    });

    // -------------------------------------------------------------------------
    // Endpoint: GET /api/health
    // -------------------------------------------------------------------------
    describe('GET /api/health', () => {
        test('debe retornar 200 y mensaje de salud', async () => {
            const response = await request(server).get('/api/health');

            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toMatch(/json/);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Weather API is running');
        });
    });

    // -------------------------------------------------------------------------
    // Endpoint: GET /api/cities/search
    // -------------------------------------------------------------------------
    describe('GET /api/cities/search', () => {
        test('debe buscar ciudades existentes', async () => {
            const response = await request(server).get('/api/cities/search?q=mad');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
            expect(response.body.data[0].name).toMatch(/Madrid/i);
        });

        test('debe devolver lista vacía si no hay coincidencias', async () => {
            const response = await request(server).get('/api/cities/search?q=kriptonita');

            expect(response.status).toBe(200);
            expect(response.body.data).toEqual([]);
        });
    });

    // -------------------------------------------------------------------------
    // Endpoint: GET /api/weather
    // -------------------------------------------------------------------------
    describe('GET /api/weather', () => {

        // Mock global de fetch para este bloque
        const mockFetch = jest.fn();
        global.fetch = mockFetch;

        beforeEach(() => {
            mockFetch.mockClear();
        });

        test('debe devolver error 400 si faltan coordenadas', async () => {
            const response = await request(server).get('/api/weather?lat=40');

            expect(response.status).toBe(400);
            expect(response.body.error).toMatch(/Parámetros lat y lon requeridos/);
        });

        test('debe devolver datos meteorológicos correctos (mocked)', async () => {
            // Arrange: Mockear respuesta de Open-Meteo
            const mockOpenMeteoResponse = {
                current_weather: { temperature: 25 },
                hourly: { time: [] }
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockOpenMeteoResponse
            });

            // Act: Llamar a nuestro endpoint
            const response = await request(server).get('/api/weather?lat=40.4&lon=-3.7&city=Madrid');

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            // Verifica datos normalizados por weatherService
            expect(response.body.data.current.temperature).toBe(25);
            expect(response.body.data.cityName).toBe('Madrid');
        });

        test('debe manejar errores del proveedor externo (500)', async () => {
            // Arrange: Simular fallo de red
            mockFetch.mockRejectedValueOnce(new Error('Network Error'));

            // Act
            const response = await request(server).get('/api/weather?lat=40&lon=-3');

            // Assert
            expect(response.status).toBe(500);
            // El servicio propaga el mensaje de error original
            expect(response.body.error).toBe('Network Error');
        });
        test('debe cumplir el contrato de datos de alertas para el frontend', async () => {
            // Arrange: Simulamos calor extremo para forzar alerta
            const mockResponse = {
                current_weather: { temperature: 45, windspeed: 10, weathercode: 0 },
                daily: { time: [], temperature_2m_max: [], temperature_2m_min: [] }
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            // Act
            const response = await request(server).get('/api/weather?lat=40&lon=-3');

            // Assert
            const alert = response.body.data.alerts[0];

            // Validamos campos exactos que usa el frontend (index.astro)
            expect(alert).toBeDefined();
            expect(alert.severity).toMatch(/warning|critical/); // Usado para color (error/warning)
            expect(alert.type).toBe('EXTREME_HEAT'); // Usado para título
            expect(alert.message).toBeDefined(); // Usado para cuerpo
        });
    });

    // -------------------------------------------------------------------------
    // Route Not Found
    // -------------------------------------------------------------------------
    describe('404 Handling', () => {
        test('debe devolver json 404 para rutas inexistentes', async () => {
            const response = await request(server).get('/api/does-not-exist');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Ruta no encontrada');
        });
    });
});
