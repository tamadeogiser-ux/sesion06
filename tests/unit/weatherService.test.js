// weatherService.test.js
import { jest } from '@jest/globals';
import {
    buildWeatherUrl,
    fetchWeatherData,
    checkWeatherAlerts,
    getWeather, // New import
    CONFIG
} from '../../src/services/weatherService.js';

describe('WeatherService Suite', () => {

    // -------------------------------------------------------------
    // Test: buildWeatherUrl
    // Objetivo: Verificar que la URL se construye correctamente con parámetros
    // -------------------------------------------------------------
    describe('buildWeatherUrl', () => {
        test('debe construir una URL válida con latitud y longitud', () => {
            // Arrange
            const params = { latitude: 40.4168, longitude: -3.7038 };

            // Act
            const url = buildWeatherUrl(params);

            // Assert
            expect(url).toContain('api.open-meteo.com');
            expect(url).toContain('latitude=40.4168');
            expect(url).toContain('longitude=-3.7038');
        });

        test('debe lanzar error si faltan coordenadas', () => {
            // Arrange
            const params = { latitude: 40.4168 }; // Falta longitude

            // Act & Assert
            expect(() => buildWeatherUrl(params)).toThrow('Latitude y longitude deben ser números');
        });

        test('debe validar rangos de latitud/longitud', () => {
            // Arrange
            const params = { latitude: 100, longitude: 0 }; // Latitud inválida

            // Act & Assert
            expect(() => buildWeatherUrl(params)).toThrow(); // Asumimos que lanza error, ajustado a implementación
        });
    });

    // -------------------------------------------------------------
    // Test: fetchWeatherData
    // Objetivo: Verificar el fetch y manejo de errores (mocks)
    // -------------------------------------------------------------
    describe('fetchWeatherData', () => {
        // Mock de fetch global
        const mockFetch = jest.fn();
        global.fetch = mockFetch;

        beforeEach(() => {
            mockFetch.mockClear();
            jest.spyOn(console, 'warn').mockImplementation(() => { });
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        test('debe retornar datos json cuando la respuesta es ok', async () => {
            // Arrange
            const mockData = { current_weather: { temperature: 20 } };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            });

            // Act
            const result = await fetchWeatherData('https://fake-url.com');

            // Assert
            expect(result).toEqual(mockData);
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        test('debe lanzar error cuando el fetch falla tras reintentos (timeout)', async () => {
            // Arrange
            // Simulamos Timeout (AbortError)
            const abortError = new Error('The user aborted a request.');
            abortError.name = 'AbortError';

            mockFetch.mockRejectedValue(abortError);

            // Act & Assert
            // fetchWeatherData tiene lógica de reintento.
            await expect(fetchWeatherData('https://fake-url.com')).rejects.toThrow('The user aborted a request.');

            // Verificamos que se haya llamado más de una vez (reintentos)
            // Initial call + 2 retries (CONFIG.MAX_RETRIES = 2) = 3 calls
            expect(mockFetch.mock.calls.length).toBeGreaterThan(1);
        }, 10000); // Aumentamos timeout del test porque hay delays en reintentos
    });

    // -------------------------------------------------------------
    // Test: checkWeatherAlerts
    // Objetivo: Verificar lógica de negocio de alertas
    // -------------------------------------------------------------
    describe('checkWeatherAlerts', () => {
        test('debe generar alerta de lluvia si la precipitación supera el umbral', () => {
            // Arrange
            const weatherData = {
                current: { windSpeed: 10, temperature: 20 },
                forecast: [
                    { date: '2023-01-01', precipitation: 50 } // Mucha lluvia
                ]
            };
            const options = { minPrecipitation: 20 };

            // Act
            const alerts = checkWeatherAlerts(weatherData, options);

            // Assert
            expect(alerts).toHaveLength(1);
            expect(alerts[0].type).toBe('HEAVY_RAIN');
            expect(alerts[0].severity).toBe('warning');
        });

        test('no debe generar alertas si el clima es tranquilo', () => {
            // Arrange
            const weatherData = {
                current: { windSpeed: 10, temperature: 20 },
                forecast: [
                    { date: '2023-01-01', precipitation: 0 }
                ]
            };

            // Act
            const alerts = checkWeatherAlerts(weatherData);

            // Assert
            expect(alerts).toHaveLength(0);
        });
    });

    // -------------------------------------------------------------
    // Test: getWeather (Integration)
    // Objetivo: Verificar orquestación completa y alertas en respuesta
    // -------------------------------------------------------------
    describe('getWeather', () => {
        // Mock global fetch para este bloque ya está configurado en fetchWeatherData describe,
        // pero necesitamos configurarlo aquí también.
        const mockFetch = jest.fn();

        beforeAll(() => {
            global.fetch = mockFetch;
        });

        beforeEach(() => {
            mockFetch.mockClear();
        });

        test('debe devolver estructura completa con alertas', async () => {
            // Arrange
            const mockApiResponse = {
                current_weather: {
                    time: '2023-01-01T00:00',
                    temperature: 42, // Calor extremo -> Alerta esperada
                    windspeed: 10,
                    winddirection: 0,
                    weathercode: 0
                },
                daily: {
                    time: ['2023-01-01'],
                    temperature_2m_max: [45],
                    temperature_2m_min: [30],
                    precipitation_sum: [0],
                    weathercode: [0]
                },
                timezone: 'UTC'
            };

            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => mockApiResponse
            });

            // Act
            const result = await getWeather({ latitude: 40, longitude: -3 });

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            // Verificar estructura normalizada
            expect(result.data.current.temperature).toBe(42);
            // Verificar alertas
            expect(result.data.alerts).toBeDefined();
            expect(result.data.alerts.length).toBeGreaterThan(0);
            expect(result.data.alerts[0].type).toBe('EXTREME_HEAT');
        });
    });
});
