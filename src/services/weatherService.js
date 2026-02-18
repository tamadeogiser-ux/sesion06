/**
 * Open-Meteo Weather Service
 * 
 * Módulo profesional para consumir la API de Open-Meteo
 * - Sin dependencias externas (usa fetch nativo de Node 18+)
 * - Separación clara de responsabilidades
 * - Manejo robusto de errores
 * - Preparado para logging, pruebas y extensiones
 * 
 * API: https://api.open-meteo.com/v1/forecast
 */

const CONFIG = {
    BASE_URL: 'https://api.open-meteo.com/v1/forecast',
    TIMEOUT_MS: 10000,
    MAX_RETRIES: 2,
};

/**
 * Construye la URL con parámetros para la API de Open-Meteo
 * @param {Object} params - Parámetros de la consulta
 * @param {number} params.latitude - Latitud
 * @param {number} params.longitude - Longitud
 * @param {Object} params.daily - Métricas diarias deseadas
 * @param {Object} params.hourly - Métricas horarias deseadas
 * @returns {string} URL construida
 */
function buildWeatherUrl(params) {
    const {
        latitude,
        longitude,
        daily = {
            temperature_2m_max: true,
            temperature_2m_min: true,
            precipitation_sum: true,
            weathercode: true,
        },
        hourly = {
            precipitation: true,
            windspeed_10m: true,
            relativehumidity_2m: true,
            temperature_2m: true,
            weathercode: true,
        },
    } = params;

    // Validaciones básicas
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        throw new Error('Latitude y longitude deben ser números');
    }

    if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
        throw new Error('Coordenadas fuera de rango válido');
    }

    const url = new URL(CONFIG.BASE_URL);
    url.searchParams.set('latitude', latitude);
    url.searchParams.set('longitude', longitude);
    url.searchParams.set('current_weather', true);
    url.searchParams.set('timezone', 'auto');

    // Parámetros diarios
    const dailyKeys = Object.keys(daily).filter((key) => daily[key]);
    if (dailyKeys.length > 0) {
        url.searchParams.set('daily', dailyKeys.join(','));
    }

    // Parámetros horarios (últimas 24h para mantener respuesta pequeña)
    const hourlyKeys = Object.keys(hourly).filter((key) => hourly[key]);
    if (hourlyKeys.length > 0) {
        url.searchParams.set('hourly', hourlyKeys.join(','));
        url.searchParams.set('forecast_hours', '24');
    }

    return url.toString();
}

/**
 * Realiza la llamada HTTP a la API con timeout y manejo de errores
 * @param {string} url - URL a consultar
 * @param {number} retryCount - Contador de reintentos (uso interno)
 * @returns {Promise<Object>} Respuesta JSON
 * @throws {Error} Si hay error en la llamada o timeout
 */
async function fetchWeatherData(url, retryCount = 0) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'IA-Weather-Service/1.0 (Node.js)',
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Manejo de errores HTTP
        if (!response.ok) {
            throw new Error(
                `API Error: ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json();

        // Validación básica de respuesta
        if (!data.current_weather) {
            throw new Error('Respuesta incompleta: falta current_weather');
        }

        return data;
    } catch (error) {
        clearTimeout(timeoutId);

        // Reintentar en caso de timeout o errores de red
        if (
            (error.name === 'AbortError' || error.message.includes('ECONNREFUSED')) &&
            retryCount < CONFIG.MAX_RETRIES
        ) {
            console.warn(
                `Reintentando (${retryCount + 1}/${CONFIG.MAX_RETRIES})...`
            );
            // Esperar antes de reintentar (backoff exponencial simple)
            await new Promise((resolve) =>
                setTimeout(resolve, Math.pow(2, retryCount) * 1000)
            );
            return fetchWeatherData(url, retryCount + 1);
        }

        throw error;
    }
}

/**
 * Parsea y normaliza la respuesta de la API
 * @param {Object} rawData - Datos crudos de la API
 * @returns {Object} Objeto normalizado con estructura clara
 */
function parseWeatherResponse(rawData) {
    const { current_weather, daily, hourly, timezone } = rawData;

    // Datos actuales
    const current = {
        timestamp: current_weather.time,
        temperature: current_weather.temperature,
        windSpeed: current_weather.windspeed,
        windDirection: current_weather.winddirection,
        weatherCode: current_weather.weathercode,
        timezone,
    };

    // Datos diarios
    const forecast = [];
    if (daily) {
        const { time, temperature_2m_max, temperature_2m_min, precipitation_sum, weathercode } =
            daily;

        for (let i = 0; i < time.length; i++) {
            forecast.push({
                date: time[i],
                tempMax: temperature_2m_max?.[i],
                tempMin: temperature_2m_min?.[i],
                precipitation: precipitation_sum?.[i],
                weatherCode: weathercode?.[i],
            });
        }
    }

    // Datos horarios
    const hourlyData = [];
    if (hourly) {
        const { time, precipitation, windspeed_10m, relativehumidity_2m, temperature_2m, weathercode } = hourly;

        for (let i = 0; i < time.length; i++) {
            hourlyData.push({
                timestamp: time[i],
                precipitation: precipitation?.[i],
                windSpeed: windspeed_10m?.[i],
                humidity: relativehumidity_2m?.[i],
                temperature: temperature_2m?.[i],
                weatherCode: weathercode?.[i],
            });
        }
    }

    return {
        current,
        forecast,
        hourly: hourlyData,
    };
}

/**
 * Genera un resumen meteorológico en lenguaje natural
 * Útil para IA, alertas automáticas y notificaciones
 * @param {Object} weatherData - Datos procesados del clima
 * @returns {string} Resumen en lenguaje natural
 */
function generateWeatherSummary(weatherData) {
    const { current, forecast } = weatherData;

    const tempText = `Temperatura actual: ${current.temperature}°C`;
    const windText = `Viento: ${current.windSpeed} km/h`;

    let summary = `${tempText}, ${windText}.`;

    // Información del próximo día
    if (forecast.length > 0) {
        const tomorrow = forecast[0];
        summary += ` Mañana: máx ${tomorrow.tempMax}°C, mín ${tomorrow.tempMin}°C.`;

        if (tomorrow.precipitation > 0) {
            summary += ` Precipitación esperada: ${tomorrow.precipitation} mm.`;
        }
    }

    return summary;
}

/**
 * API principal: obtener el clima de una ubicación
 * @param {Object} location - { latitude, longitude }
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<Object>} Objeto con clima normalizado
 */
async function getWeather(location, options = {}) {
    try {
        // Construir URL
        const url = buildWeatherUrl({
            latitude: location.latitude,
            longitude: location.longitude,
            ...options,
        });

        // Hacer la llamada
        const rawData = await fetchWeatherData(url);

        // Parsear respuesta
        const weatherData = parseWeatherResponse(rawData);

        // Generar alertas
        const alerts = checkWeatherAlerts(weatherData);

        return {
            success: true,
            data: {
                ...weatherData,
                alerts,
            },
            summary: generateWeatherSummary(weatherData),
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            data: null,
        };
    }
}

/**
 * Función para obtener alertas basadas en condiciones
 * Extensible para añadir nuevos tipos de alertas
 * @param {Object} weatherData - Datos procesados del clima
 * @param {Object} thresholds - Umbrales para las alertas
 * @returns {Array<Object>} Array de alertas activas
 */
function checkWeatherAlerts(weatherData, thresholds = {}) {
    const alerts = [];
    const { current, hourly, forecast } = weatherData;

    const {
        maxWind = 50, // km/h
        minTemperature = -10, // °C
        maxTemperature = 40, // °C
        minPrecipitation = 10, // mm
    } = thresholds;

    // Alerta por viento fuerte
    if (current.windSpeed > maxWind) {
        alerts.push({
            type: 'HIGH_WIND',
            severity: 'warning',
            message: `Viento fuerte: ${current.windSpeed} km/h (umbral: ${maxWind})`,
            value: current.windSpeed,
        });
    }

    // Alerta por temperaturas extremas
    if (current.temperature < minTemperature) {
        alerts.push({
            type: 'EXTREME_COLD',
            severity: 'critical',
            message: `Temperatura muy baja: ${current.temperature}°C`,
            value: current.temperature,
        });
    }

    if (current.temperature > maxTemperature) {
        alerts.push({
            type: 'EXTREME_HEAT',
            severity: 'critical',
            message: `Temperatura muy alta: ${current.temperature}°C`,
            value: current.temperature,
        });
    }

    // Alerta por lluvia intensa en el pronóstico diario
    if (forecast.length > 0) {
        forecast.forEach((day, index) => {
            if (day.precipitation > minPrecipitation) {
                alerts.push({
                    type: 'HEAVY_RAIN',
                    severity: 'warning',
                    date: day.date,
                    message: `Lluvia intensa esperada: ${day.precipitation} mm`,
                    value: day.precipitation,
                });
            }
        });
    }

    return alerts;
}

// Exportar como módulo
export {
    // Funciones principales
    getWeather,
    checkWeatherAlerts,

    // Funciones auxiliares (para testing y usos avanzados)
    buildWeatherUrl,
    fetchWeatherData,
    parseWeatherResponse,
    generateWeatherSummary,

    // Configuración (para override si es necesario)
    CONFIG,
};
