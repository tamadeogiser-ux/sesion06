/**
 * Genera datos de respaldo (Mock) para Valencia
 * cuando falla la API o para estado inicial.
 */
export function generateFallbackData() {
    return {
        current: {
            temperature: 22.0,
            description: 'Soleado',
            humidity: 45,
            windSpeed: 12.0,
            feelsLike: 23.5,
            timestamp: new Date().toISOString(),
        },
        forecast: Array(7).fill(0).map((_, i) => ({
            date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
            tempMax: 24 + Math.random() * 5,
            tempMin: 15 + Math.random() * 5,
            precipitation: 0,
            description: 'Cielo despejado',
        })),
        hourly: Array(24).fill(0).map((_, i) => ({
            time: `${new Date(Date.now() + i * 3600000).getHours()}:00`,
            temperature: 20 + Math.random() * 3,
            precipitation: 0,
            description: 'Despejado',
        })),
        alerts: [],
    };
}

/**
 * Transforma la respuesta de la API Backend al formato que necesita el Frontend de Astro.
 * @param {Object} apiData - Datos crudos del endpoint /api/weather
 * @returns {Object} Datos formateados para los componentes
 */
export function formatWeatherData(apiData) {
    if (!apiData) return generateFallbackData();

    const { current, forecast, hourly, alerts } = apiData;

    // Procesar horario: Próximas 12 horas desde ahora
    const currentHourClipped = new Date().toISOString().slice(0, 13); // '2023-01-01T10'

    // Filtrar y mapear horario
    let hourlyMapped = [];
    if (Array.isArray(hourly)) {
        hourlyMapped = hourly
            .filter(h => h.timestamp >= currentHourClipped)
            .slice(0, 24)
            .map(h => ({
                time: h.timestamp.split('T')[1].slice(0, 5), // '10:00'
                temperature: h.temperature ?? 0,
                precipitation: h.precipitation ?? 0,
                description: mapWeatherCode(h.weatherCode),
            }));
    }

    return {
        current: {
            temperature: current?.temperature ?? 0,
            description: mapWeatherCode(current?.weatherCode),
            humidity: current?.humidity ?? 0,
            windSpeed: current?.windSpeed ?? 0,
            feelsLike: current?.temperature ?? 0, // Fallback simple
            timestamp: new Date().toISOString(),
        },
        forecast: Array.isArray(forecast) ? forecast.map(day => ({
            date: day.date,
            tempMax: day.tempMax,
            tempMin: day.tempMin,
            precipitation: day.precipitation,
            description: mapWeatherCode(day.weatherCode),
        })) : [],
        hourly: hourlyMapped,
        alerts: Array.isArray(alerts) ? alerts : [],
    };
}

/**
 * Mapea códigos numéricos WMO a descripciones legibles
 * (Simplificado para el ejemplo)
 */
function mapWeatherCode(code) {
    if (code === undefined || code === null) return 'Normal';
    // Ejemplo de mapeo básico
    if (code === 0) return 'Despejado';
    if (code >= 1 && code <= 3) return 'Parcialmente Nublado';
    if (code >= 45 && code <= 48) return 'Niebla';
    if (code >= 51 && code <= 67) return 'Lluvia';
    if (code >= 71 && code <= 77) return 'Nieve';
    return 'Condiciones variables';
}
