import { describe, it, expect, vi } from 'vitest';
import { formatWeatherData, generateFallbackData } from '../../src/utils/weatherMapper';

describe('Frontend Logic - WeatherMapper', () => {

    describe('generateFallbackData', () => {
        it('debe generar una estructura válida por defecto', () => {
            const data = generateFallbackData();

            expect(data).toHaveProperty('current');
            expect(data).toHaveProperty('forecast');
            expect(data).toHaveProperty('alerts');
            expect(data).toHaveProperty('hourly'); // Nuevo check

            expect(data.current.description).toBe('Soleado');
            expect(data.forecast).toHaveLength(7);
            expect(data.hourly).toHaveLength(24); // Mock genera 24
        });
    });

    describe('formatWeatherData', () => {
        it('debe manejar datos nulos retornando fallback', () => {
            const result = formatWeatherData(null);
            expect(result.current.description).toBe('Soleado');
        });

        it('debe mapear correctamente la respuesta del API', () => {
            const mockApiData = {
                current: {
                    temperature: 25,
                    weatherCode: 0,
                    humidity: 50,
                    windSpeed: 10
                },
                forecast: [
                    { date: '2023-01-01', tempMax: 20, tempMin: 10, precipitation: 0, weatherCode: 1 }
                ],
                hourly: [
                    { timestamp: '2099-01-01T10:00', temperature: 18, precipitation: 0, weatherCode: 0 },
                    { timestamp: '2099-01-01T11:00', temperature: 19, precipitation: 0, weatherCode: 0 }
                ],
                alerts: [{ type: 'HEAT', message: 'Calor' }]
            };

            const result = formatWeatherData(mockApiData);

            expect(result.current.temperature).toBe(25);
            expect(result.hourly).toBeDefined();
            // Validar filtrado (timestamps en futuro)
            expect(result.hourly.length).toBeGreaterThan(0);
            expect(result.hourly[0].time).toMatch(/^\d{2}:00$/);
            expect(result.hourly[0].temperature).toBe(18);
        });

        it('debe manejar horarios vacíos sin romper ejecucion', () => {
            const mockApiData = {
                current: {},
                forecast: [],
                hourly: [], // Array vacío
                alerts: []
            };
            const result = formatWeatherData(mockApiData);
            expect(result.hourly).toEqual([]);
            expect(result.hourly).toHaveLength(0);
        });

        it('debe respetar el límite exacto de 24 horas', () => {
            // Generamos 30 horas falsas en el futuro
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);

            const manyHours = Array(30).fill(0).map((_, i) => ({
                timestamp: new Date(futureDate.getTime() + i * 3600000).toISOString(),
                temperature: 20
            }));

            const mockApiData = {
                current: {},
                forecast: [],
                hourly: manyHours,
                alerts: []
            };

            const result = formatWeatherData(mockApiData);
            expect(result.hourly).toHaveLength(24);
        });

        it('debe manejar códigos de clima desconocidos', () => {
            const mockApiData = {
                current: { weatherCode: 999 },
                forecast: [],
                alerts: []
            };

            const result = formatWeatherData(mockApiData);
            expect(result.current.description).toBe('Condiciones variables');
        });
    });
});
