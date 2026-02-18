// tests/integration/regression.test.js
import { jest } from '@jest/globals';
import http from 'http';
import request from 'supertest';

// Importamos el requestHandler real
import { requestHandler } from '../../server.js';

describe('Regression & Safe-Vibe Test Suite', () => {
    let server;

    // Mock de fetch global para no depender de Open-Meteo real
    const mockFetch = jest.fn();
    global.fetch = mockFetch;

    beforeAll(() => {
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(console, 'warn').mockImplementation(() => { });
        server = http.createServer(requestHandler);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        mockFetch.mockClear();
    });

    // ---------------------------------------------------------------------------------------
    // Contract Check: Full Flow (Server -> Service -> Fetch -> Service -> Server -> Frontend)
    // ---------------------------------------------------------------------------------------
    describe('Full Stack Contract Stability', () => {

        test('Debe transformar correctamente los datos crudos de Open-Meteo a la estructura Vibe del Frontend', async () => {
            // ARRANGE: Respuesta cruda simulada de Open-Meteo
            const openMeteoResponse = {
                current_weather: {
                    temperature: 20.5,
                    windspeed: 15,
                    weathercode: 0,
                    time: new Date().toISOString()
                },
                daily: {
                    time: ['2023-01-01'],
                    temperature_2m_max: [22],
                    temperature_2m_min: [10],
                    precipitation_sum: [0],
                    weathercode: [0]
                },
                hourly: {
                    time: ['2023-01-01T10:00', '2023-01-01T11:00'],
                    temperature_2m: [20, 21],
                    precipitation: [0, 0],
                    weathercode: [0, 0],
                    windspeed_10m: [10, 12],
                    relativehumidity_2m: [50, 48]
                }
            };

            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => openMeteoResponse
            });

            // ACT
            const response = await request(server).get('/api/weather?lat=40&lon=-3');

            // ASSERT: "Vibe Check" -> ¿La estructura final es la que espera el frontend?
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            const data = response.body.data;

            // 1. Current Weather
            expect(data.current).toBeDefined();
            expect(data.current.temperature).toBe(20.5); // Dato preservado

            // 2. Pronóstico
            expect(data.forecast).toBeInstanceOf(Array);
            expect(data.forecast[0]).toHaveProperty('tempMax');

            // 3. Hourly (CRÍTICO: Nueva funcionalidad vibe)
            expect(data.hourly).toBeInstanceOf(Array);
            expect(data.hourly.length).toBe(2);
            expect(data.hourly[0]).toHaveProperty('temperature');
            expect(data.hourly[0]).toHaveProperty('weatherCode');
            expect(data.hourly[0]).toHaveProperty('timestamp'); // El frontend mapper usa 'timestamp'

            // 4. Alert System
            expect(data.alerts).toBeInstanceOf(Array);
        });

        test('Debe generar Alerta si los datos crudos indican condiciones extremas', async () => {
            // ARRANGE: Viento huracanado en datos crudos
            const stormyResponse = {
                current_weather: {
                    temperature: 20,
                    windspeed: 100, // 100 km/h -> Alerta
                    weathercode: 1,
                    time: new Date().toISOString()
                }
            };

            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => stormyResponse
            });

            // ACT
            const response = await request(server).get('/api/weather?lat=40&lon=-3');

            // ASSERT
            expect(response.body.data.alerts.length).toBeGreaterThan(0);
            expect(response.body.data.alerts[0].type).toBe('HIGH_WIND');
            expect(response.body.data.alerts[0].severity).toBe('warning');
        });
    });

    // -------------------------------------------------------------
    // Resilience Check
    // -------------------------------------------------------------
    describe('Resilience', () => {
        test('Debe manejar fallo de red de Open-Meteo', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 503,
                statusText: 'Service Unavailable'
            });

            const response = await request(server).get('/api/weather?lat=40&lon=-3');

            expect(response.body.success).toBe(false);
            expect(response.body.error).toMatch(/API Error/);
        });
    });
});
