/**
 * Ejemplo Avanzado: Integración Completa con Logging, Caché y Métricas
 * 
 * Muestra cómo usar el Weather Service en un escenario real de producción
 */

const weatherService = require('../services/weatherService');
const {
    Logger,
    MetricsCollector,
    WeatherCache,
    getWeatherDescription,
    calculateHeatIndex,
    calculateWindChill,
    getActivityRecommendations,
} = require('../utils/weatherUtils');

// Instanciar componentes de producción
const logger = new Logger('WeatherApp');
const metrics = new MetricsCollector();
const cache = new WeatherCache(600); // 10 minutos TTL

/**
 * Servicio de clima con observabilidad completa
 */
class ProductionWeatherService {
    constructor() {
        this.logger = logger;
        this.metrics = metrics;
        this.cache = cache;
    }

    /**
     * Obtener clima con logging y caché
     */
    async getWeatherWithObservability(location) {
        const startTime = Date.now();
        const { latitude, longitude } = location;

        try {
            // 1. Comprobar caché
            this.logger.debug('Checking cache', { latitude, longitude });
            const cachedData = this.cache.get(latitude, longitude);

            if (cachedData) {
                this.logger.info('Cache hit', { latitude, longitude });
                const responseTime = Date.now() - startTime;
                this.metrics.recordRequest(responseTime, true);
                return {
                    success: true,
                    data: cachedData,
                    source: 'cache',
                    responseTime,
                };
            }

            // 2. Llamar a la API
            this.logger.info('Fetching from API', { latitude, longitude });
            const result = await weatherService.getWeather(location);

            const responseTime = Date.now() - startTime;

            if (!result.success) {
                this.metrics.recordRequest(responseTime, false);
                this.logger.error('API Error', {
                    latitude,
                    longitude,
                    error: result.error,
                    responseTime,
                });
                return {
                    success: false,
                    error: result.error,
                    responseTime,
                };
            }

            // 3. Guardar en caché
            this.cache.set(latitude, longitude, result.data);
            this.logger.info('Cached weather data', { latitude, longitude });

            // 4. Registrar éxito
            this.metrics.recordRequest(responseTime, true);
            this.logger.info('Request successful', {
                latitude,
                longitude,
                responseTime,
            });

            return {
                success: true,
                data: result.data,
                source: 'api',
                responseTime,
            };
        } catch (error) {
            const responseTime = Date.now() - startTime;
            this.metrics.recordRequest(responseTime, false);
            this.logger.error('Unexpected error', {
                latitude,
                longitude,
                error: error.message,
                responseTime,
            });

            return {
                success: false,
                error: error.message,
                responseTime,
            };
        }
    }

    /**
     * Generar reporte meteorológico completo
     */
    generateDetailedReport(weatherData) {
        const { current, forecast, hourly } = weatherData;

        // Calcular índices de confort
        const heatIndex = calculateHeatIndex(
            current.temperature,
            hourly[0]?.humidity || 50
        );
        const windChill = calculateWindChill(current.temperature, current.windSpeed);

        // Obtener recomendaciones
        const recommendations = getActivityRecommendations(weatherData);

        // Construir reporte
        return {
            summary: {
                location: `Lat: ${current.temperature}°C, Lon: ${current.windSpeed} km/h`,
                timestamp: current.timestamp,
                description: getWeatherDescription(current.weatherCode),
            },
            current: {
                temperature: current.temperature,
                feelsLike: {
                    windChill,
                    heatIndex,
                },
                wind: {
                    speed: current.windSpeed,
                    direction: current.windDirection,
                },
                humidity: hourly[0]?.humidity || 'N/A',
            },
            forecast: forecast.slice(0, 5).map((day) => ({
                date: day.date,
                tempRange: `${day.tempMin}°C - ${day.tempMax}°C`,
                precipitation: `${day.precipitation}mm`,
                description: getWeatherDescription(day.weatherCode),
            })),
            recommendations,
        };
    }

    /**
     * Monitorear múltiples ubicaciones (para dashboard)
     */
    async monitorCities(cities) {
        this.logger.info('Monitoring multiple cities', { count: cities.length });

        const results = await Promise.all(
            cities.map((city) =>
                this.getWeatherWithObservability({
                    latitude: city.latitude,
                    longitude: city.longitude,
                }).then((result) => ({
                    city: city.name,
                    ...result,
                }))
            )
        );

        return results;
    }

    /**
     * Obtener estadísticas del servicio
     */
    getStats() {
        return {
            metrics: this.metrics.getMetrics(),
            cache: this.cache.getStats(),
            uptime: process.uptime(),
        };
    }

    /**
     * Limpiar recursos
     */
    cleanup() {
        this.cache.cleanup();
        this.logger.info('Cache cleaned');
    }
}

/**
 * Ejemplo 1: Reporte detallado de una ubicación
 */
async function example1_DetailedReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 EJEMPLO 1: Reporte Detallado');
    console.log('='.repeat(60) + '\n');

    const service = new ProductionWeatherService();

    const result = await service.getWeatherWithObservability({
        latitude: 40.4168,  // Madrid
        longitude: -3.7038,
    });

    if (result.success) {
        const report = service.generateDetailedReport(result.data);

        console.log('📍 Ubicación:', report.summary);
        console.log('\n🌡️  Temperatura Actual:');
        console.log(`   ${report.current.temperature}°C`);
        console.log(`   Sensación térmica (viento): ${report.current.feelsLike.windChill}°C`);
        console.log(`   Índice de calor: ${report.current.feelsLike.heatIndex}°C`);

        console.log('\n💨 Viento:');
        console.log(`   Velocidad: ${report.current.wind.speed} km/h`);
        console.log(`   Dirección: ${report.current.wind.direction}°`);

        console.log('\n📅 Pronóstico (5 días):');
        report.forecast.forEach((day) => {
            console.log(`   ${day.date}: ${day.tempRange}`);
            console.log(`   ${day.description} (${day.precipitation})`);
        });

        console.log('\n💡 Recomendaciones:');
        report.recommendations.forEach((rec) => console.log(`   ${rec}`));

        console.log(
            `\n⏱️  Tiempo de respuesta: ${result.responseTime}ms (desde: ${result.source})`
        );
    } else {
        console.error('❌ Error:', result.error);
    }
}

/**
 * Ejemplo 2: Monitorear múltiples ciudades (dashboard)
 */
async function example2_MultipleLocations() {
    console.log('\n' + '='.repeat(60));
    console.log('🌍 EJEMPLO 2: Monitoreo Multi-Ubicación');
    console.log('='.repeat(60) + '\n');

    const service = new ProductionWeatherService();

    const cities = [
        { name: '🇪🇸 Madrid', latitude: 40.4168, longitude: -3.7038 },
        { name: '🇪🇸 Barcelona', latitude: 41.3851, longitude: 2.1734 },
        { name: '🇪🇸 Sevilla', latitude: 37.3886, longitude: -5.9823 },
        { name: '🇬🇧 Londres', latitude: 51.5074, longitude: -0.1278 },
        { name: '🇫🇷 París', latitude: 48.8566, longitude: 2.3522 },
    ];

    const results = await service.monitorCities(cities);

    console.log('Resultados:\n');
    results.forEach((result) => {
        if (result.success) {
            const { current, summary } = result.data;
            console.log(`${result.city}`);
            console.log(`  🌡️  ${current.temperature}°C`);
            console.log(`  💨 Viento: ${current.windSpeed} km/h`);
            console.log(`  📡 Fuente: ${result.source} (${result.responseTime}ms)`);
        } else {
            console.log(`${result.city} ❌ ${result.error}`);
        }
        console.log();
    });
}

/**
 * Ejemplo 3: Estadísticas y observabilidad
 */
async function example3_Statistics() {
    console.log('\n' + '='.repeat(60));
    console.log('📈 EJEMPLO 3: Estadísticas y Observabilidad');
    console.log('='.repeat(60) + '\n');

    const service = new ProductionWeatherService();

    // Hacer varias llamadas
    console.log('Realizando 5 llamadas de ejemplo...\n');

    for (let i = 0; i < 5; i++) {
        await service.getWeatherWithObservability({
            latitude: 40.4168 + Math.random() * 0.1,
            longitude: -3.7038 + Math.random() * 0.1,
        });
    }

    // Mostrar estadísticas
    const stats = service.getStats();

    console.log('📊 Estadísticas del Servicio:\n');
    console.log(`  Solicitudes totales: ${stats.metrics.requestCount}`);
    console.log(`  Éxitos: ${stats.metrics.successCount}`);
    console.log(`  Errores: ${stats.metrics.errorCount}`);
    console.log(
        `  Tasa de éxito: ${stats.metrics.successRate.toFixed(2)}%`
    );
    console.log(
        `  Tiempo promedio: ${stats.metrics.averageResponseTime.toFixed(0)}ms`
    );

    console.log('\n💾 Estadísticas de Caché:\n');
    console.log(`  Elementos en caché: ${stats.cache.size}`);
    console.log(`  TTL: ${stats.cache.ttl}s`);

    console.log(`\n⏱️  Uptime del proceso: ${Math.floor(stats.uptime)}s`);
}

/**
 * Ejecutar todos los ejemplos
 */
async function runAllExamples() {
    try {
        await example1_DetailedReport();
        await example2_MultipleLocations();
        await example3_Statistics();

        console.log('\n' + '='.repeat(60));
        console.log('✨ Todos los ejemplos completados');
        console.log('='.repeat(60) + '\n');
    } catch (error) {
        console.error('❌ Error en ejemplos:', error.message);
    }
}

// Ejecutar si se corre directamente
if (require.main === module) {
    // Descomentar el ejemplo que quieras ejecutar
    // runAllExamples();
    example1_DetailedReport();
    // example2_MultipleLocations();
    // example3_Statistics();
}

module.exports = {
    ProductionWeatherService,
    example1_DetailedReport,
    example2_MultipleLocations,
    example3_Statistics,
    runAllExamples,
};
