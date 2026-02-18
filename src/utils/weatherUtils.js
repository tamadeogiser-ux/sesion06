/**
 * Configuración y Utilidades Avanzadas
 * 
 * Para logging, métricas y extensiones de la integración
 */

/**
 * Logger simple y extensible
 * Preparado para integración con Winston, Pino, etc.
 */
class Logger {
    constructor(namespace = 'WeatherService') {
        this.namespace = namespace;
    }

    info(message, data = {}) {
        console.log(`[${this.namespace}] ℹ️  ${message}`, data);
    }

    warn(message, data = {}) {
        console.warn(`[${this.namespace}] ⚠️  ${message}`, data);
    }

    error(message, error = {}) {
        console.error(`[${this.namespace}] ❌ ${message}`, error);
    }

    debug(message, data = {}) {
        if (process.env.DEBUG === 'true') {
            console.log(`[${this.namespace}] 🐛 ${message}`, data);
        }
    }
}

/**
 * Gestor de métricas y observabilidad
 * Prepara datos para enviar a Datadog, NewRelic, etc.
 */
class MetricsCollector {
    constructor() {
        this.metrics = {
            requestCount: 0,
            successCount: 0,
            errorCount: 0,
            averageResponseTime: 0,
            totalResponseTime: 0,
        };
    }

    recordRequest(responseTime, success = true) {
        this.metrics.requestCount++;
        this.metrics.totalResponseTime += responseTime;

        if (success) {
            this.metrics.successCount++;
        } else {
            this.metrics.errorCount++;
        }

        this.metrics.averageResponseTime =
            this.metrics.totalResponseTime / this.metrics.requestCount;
    }

    getMetrics() {
        return {
            ...this.metrics,
            successRate:
                (this.metrics.successCount / this.metrics.requestCount) * 100,
        };
    }

    reset() {
        this.metrics = {
            requestCount: 0,
            successCount: 0,
            errorCount: 0,
            averageResponseTime: 0,
            totalResponseTime: 0,
        };
    }
}

/**
 * Caché local simple (preparado para Redis)
 * TTL en segundos
 */
class WeatherCache {
    constructor(ttlSeconds = 600) {
        this.cache = new Map();
        this.ttl = ttlSeconds;
    }

    /**
     * Genera clave de caché basada en coordenadas
     */
    getKey(latitude, longitude) {
        return `weather_${latitude}_${longitude}`;
    }

    /**
     * Obtiene dato del caché si existe y no ha expirado
     */
    get(latitude, longitude) {
        const key = this.getKey(latitude, longitude);
        const cached = this.cache.get(key);

        if (!cached) return null;

        // Comprobar expiración
        if (Date.now() > cached.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    /**
     * Almacena dato en caché
     */
    set(latitude, longitude, data) {
        const key = this.getKey(latitude, longitude);
        this.cache.set(key, {
            data,
            expiresAt: Date.now() + this.ttl * 1000,
        });
    }

    /**
     * Limpia caché expirada
     */
    cleanup() {
        for (const [key, value] of this.cache.entries()) {
            if (Date.now() > value.expiresAt) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Limpia todo el caché
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Estadísticas del caché
     */
    getStats() {
        return {
            size: this.cache.size,
            ttl: this.ttl,
        };
    }
}

/**
 * Conversión de códigos meteorológicos WMO a texto
 * Referencia: https://www.wmo.int/en
 */
const WMO_WEATHER_CODES = {
    0: 'Cielo despejado',
    1: 'Principalmente despejado',
    2: 'Parcialmente nublado',
    3: 'Nublado',
    45: 'Niebla',
    48: 'Niebla escarchada',
    51: 'Llovizna ligera',
    53: 'Llovizna moderada',
    55: 'Llovizna densa',
    61: 'Lluvia débil',
    63: 'Lluvia moderada',
    65: 'Lluvia fuerte',
    71: 'Nieve débil',
    73: 'Nieve moderada',
    75: 'Nieve fuerte',
    77: 'Aguanieve',
    80: 'Lluvia fuerte aislada',
    81: 'Lluvia fuerte',
    82: 'Lluvia muy fuerte',
    85: 'Nieve de aguanieve aislada',
    86: 'Nieve de aguanieve',
    95: 'Tormenta débil',
    96: 'Tormenta con granizo débil',
    99: 'Tormenta con granizo',
};

/**
 * Convierte código WMO a descripción
 */
function getWeatherDescription(code) {
    return WMO_WEATHER_CODES[code] || 'Desconocido';
}

/**
 * Calcula índice de calor (Heat Index)
 * Útil para alertas de calor extremo
 */
function calculateHeatIndex(tempC, humidity) {
    const tempF = tempC * 9 / 5 + 32;

    if (tempF < 68) return tempC; // No aplicable

    const c1 = -42.379;
    const c2 = 2.04901523;
    const c3 = 10.14333127;
    const c4 = -0.22475541;
    const c5 = -0.00683783;
    const c6 = -0.05481717;
    const c7 = 0.00122874;
    const c8 = 0.00085282;
    const c9 = -0.00000199;

    const HI = c1 + (c2 * tempF) + (c3 * humidity) + (c4 * tempF * humidity) +
        (c5 * tempF * tempF) + (c6 * humidity * humidity) +
        (c7 * tempF * tempF * humidity) + (c8 * tempF * humidity * humidity) +
        (c9 * tempF * tempF * humidity * humidity);

    return Math.round((HI - 32) * 5 / 9 * 10) / 10; // Convertir a Celsius
}

/**
 * Calcula sensación térmica (Wind Chill)
 * Para temperaturas frías con viento
 */
function calculateWindChill(tempC, windSpeedKmh) {
    if (tempC > 10) return tempC; // No aplicable

    return Math.round(
        (13.12 + 0.6215 * tempC - 11.37 * Math.pow(windSpeedKmh, 0.16) +
            0.3965 * tempC * Math.pow(windSpeedKmh, 0.16)) * 10
    ) / 10;
}

/**
 * Análisis de calidad del aire basado en condiciones meteorológicas
 * Nota: Open-Meteo no proporciona datos de AQI directamente
 * Este es un estimador básico
 */
function estimateAirQuality(humidity, precipitation, windSpeed) {
    let score = 100; // Excelente

    // Alta humedad sin lluvia → Mala dispersión
    if (humidity > 80 && precipitation === 0) {
        score -= 20;
    }

    // Viento bajo → Mala dispersión
    if (windSpeed < 5) {
        score -= 15;
    }

    // Lluvia → Limpia el aire
    if (precipitation > 0) {
        score += 10;
    }

    return Math.max(0, Math.min(100, score));
}

/**
 * Interpreta condiciones para recomendaciones
 */
function getActivityRecommendations(weatherData) {
    const { current, forecast } = weatherData;
    const recommendations = [];

    // Actividades al aire libre
    if (current.temperature > 15 && current.temperature < 25 && current.windSpeed < 30) {
        recommendations.push('✅ Excelente para actividades al aire libre');
    }

    // Advertencias
    if (current.temperature < 0) {
        recommendations.push('⚠️  Peligro de hielo - conducción con cuidado');
    }

    if (current.windSpeed > 50) {
        recommendations.push('⚠️  Viento muy fuerte - no recomendado salir');
    }

    // Lluvia
    if (forecast.length > 0 && forecast[0].precipitation > 10) {
        recommendations.push('🌧️  Lluvia importante esperada - llevar paraguas');
    }

    return recommendations;
}

// Exportar utilidades
export {
    Logger,
    MetricsCollector,
    WeatherCache,
    WMO_WEATHER_CODES,
    getWeatherDescription,
    calculateHeatIndex,
    calculateWindChill,
    estimateAirQuality,
    getActivityRecommendations,
};
