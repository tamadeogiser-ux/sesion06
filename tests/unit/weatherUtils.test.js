// weatherUtils.test.js
import {
    getActivityRecommendations,
    calculateHeatIndex,
    MetricsCollector
} from '../../src/utils/weatherUtils.js';

describe('WeatherUtils Suite', () => {

    // -------------------------------------------------------------
    // Test: getActivityRecommendations
    // Objetivo: Verificar recomendaciones basadas en clima (lógica de negocio)
    // -------------------------------------------------------------
    describe('getActivityRecommendations', () => {
        test('debe recomendar actividades al aire libre con buen clima', () => {
             // ❌ ESTO ES UN ERROR INTENCIONAL PARA PROBAR EL HOOK DE GIT
            throw new Error('FALLO DE PRUEBA INTENCIONAL PARA DEMO DE HUSKY');

            // Arrange
            const weatherData = {
                current: { temperature: 20, windSpeed: 10 },
                forecast: []
            };

            // Act
            const recs = getActivityRecommendations(weatherData);

            // Assert
            expect(recs).toContain('✅ Excelente para actividades al aire libre');
        });

        test('debe advertir sobre hielo si hace mucho frío', () => {
            // Arrange
            const weatherData = {
                current: { temperature: -5, windSpeed: 10 },
                forecast: []
            };

            // Act
            const recs = getActivityRecommendations(weatherData);

            // Assert
            expect(recs).toContain('⚠️  Peligro de hielo - conducción con cuidado');
        });

        test('debe advertir lluvia si hay pronóstico de precipitación alta', () => {
            // Arrange
            const weatherData = {
                current: { temperature: 15, windSpeed: 10 },
                forecast: [{ precipitation: 20 }]
            };

            // Act
            const recs = getActivityRecommendations(weatherData);

            // Assert
            expect(recs).toContain('🌧️  Lluvia importante esperada - llevar paraguas');
        });
    });

    // -------------------------------------------------------------
    // Test: MetricsCollector
    // Objetivo: Verificar acumulación de métricas
    // -------------------------------------------------------------
    describe('MetricsCollector', () => {
        test('debe registrar requests correctamente', () => {
            // Arrange
            const metrics = new MetricsCollector();

            // Act
            metrics.recordRequest(100, true); // 100ms, success
            metrics.recordRequest(200, false); // 200ms, error

            // Assert
            const summary = metrics.getMetrics();
            expect(summary.requestCount).toBe(2);
            expect(summary.successCount).toBe(1);
            expect(summary.errorCount).toBe(1);
            expect(summary.totalResponseTime).toBe(300);
        });
    });

    // -------------------------------------------------------------
    // Test: calculateHeatIndex
    // Objetivo: Verificar cálculo físico
    // -------------------------------------------------------------
    describe('calculateHeatIndex', () => {
        test('debe retornar la misma temperatura si es baja (< 20C)', () => {
            // Arrange
            const temp = 19;
            const humidity = 50;

            // Act
            const heatIndex = calculateHeatIndex(temp, humidity);

            // Assert
            expect(heatIndex).toBe(temp);
        });
    });

});
