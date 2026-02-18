/**
 * Ejemplo básico de uso del Weather Service
 * 
 * Este archivo muestra cómo integrar el servicio de clima
 * en una aplicación Node.js
 */

const weatherService = require('../services/weatherService');

/**
 * Ejemplo 1: Obtener clima actual de una ubicación
 */
async function example1_getWeather() {
    console.log('\n📍 EJEMPLO 1: Obtener clima actual');
    console.log('─'.repeat(50));

    // Coordenadas de Madrid, España
    const location = {
        latitude: 40.4168,
        longitude: -3.7038,
    };

    const result = await weatherService.getWeather(location);

    if (result.success) {
        console.log('✅ Datos obtenidos exitosamente\n');
        console.log('Clima actual:', result.data.current);
        console.log('\n📝 Resumen:', result.summary);
    } else {
        console.error('❌ Error:', result.error);
    }
}

/**
 * Ejemplo 2: Obtener clima y comprobar alertas
 */
async function example2_withAlerts() {
    console.log('\n🚨 EJEMPLO 2: Clima con alertas');
    console.log('─'.repeat(50));

    // Coordenadas de Nueva York
    const location = {
        latitude: 40.7128,
        longitude: -74.006,
    };

    const result = await weatherService.getWeather(location);

    if (result.success) {
        console.log('✅ Datos obtenidos\n');

        // Definir umbrales personalizados para alertas
        const thresholds = {
            maxWind: 40, // km/h
            minTemperature: 0,
            maxTemperature: 35,
            minPrecipitation: 5, // mm
        };

        const alerts = weatherService.checkWeatherAlerts(
            result.data,
            thresholds
        );

        if (alerts.length > 0) {
            console.log(`⚠️  Se encontraron ${alerts.length} alerta(s):\n`);
            alerts.forEach((alert) => {
                console.log(
                    `  [${alert.severity.toUpperCase()}] ${alert.type}`
                );
                console.log(`  ${alert.message}\n`);
            });
        } else {
            console.log('✅ No hay alertas activas');
        }
    } else {
        console.error('❌ Error:', result.error);
    }
}

/**
 * Ejemplo 3: Obtener pronóstico detallado
 */
async function example3_detailedForecast() {
    console.log('\n🌤️  EJEMPLO 3: Pronóstico detallado');
    console.log('─'.repeat(50));

    // Coordenadas de Barcelona, España
    const location = {
        latitude: 41.3851,
        longitude: 2.1734,
    };

    // Opciones personalizadas
    const options = {
        daily: {
            temperature_2m_max: true,
            temperature_2m_min: true,
            precipitation_sum: true,
            weathercode: true,
        },
        hourly: {
            precipitation: true,
            windspeed_10m: true,
            relativehumidity_2m: true,
        },
    };

    const result = await weatherService.getWeather(location, options);

    if (result.success) {
        console.log('✅ Datos obtenidos\n');

        // Mostrar pronóstico de los próximos 3 días
        console.log('📅 Pronóstico de los próximos días:\n');
        result.data.forecast.slice(0, 3).forEach((day, index) => {
            console.log(`${index + 1}. ${day.date}`);
            console.log(
                `   Temperatura: ${day.tempMin}°C - ${day.tempMax}°C`
            );
            console.log(`   Precipitación: ${day.precipitation} mm\n`);
        });

        // Mostrar datos horarios (próximas 6 horas)
        console.log('⏰ Datos horarios (próximas 6 horas):\n');
        result.data.hourly.slice(0, 6).forEach((hour, index) => {
            console.log(`${index + 1}. ${hour.timestamp}`);
            console.log(`   Lluvia: ${hour.precipitation} mm`);
            console.log(`   Viento: ${hour.windSpeed} km/h`);
            console.log(`   Humedad: ${hour.humidity}%\n`);
        });
    } else {
        console.error('❌ Error:', result.error);
    }
}

/**
 * Ejemplo 4: Usar para integraciones IA/Bots
 */
async function example4_aiIntegration() {
    console.log('\n🤖 EJEMPLO 4: Integración IA/Bots');
    console.log('─'.repeat(50));

    // Múltiples ubicaciones
    const cities = [
        { name: 'Madrid', lat: 40.4168, lon: -3.7038 },
        { name: 'Barcelona', lat: 41.3851, lon: 2.1734 },
        { name: 'Valencia', lat: 39.4699, lon: -0.376 },
    ];

    console.log('Consultando clima de varias ciudades...\n');

    for (const city of cities) {
        const result = await weatherService.getWeather({
            latitude: city.lat,
            longitude: city.lon,
        });

        if (result.success) {
            console.log(`📍 ${city.name}:`);
            console.log(`   ${result.summary}\n`);
        }
    }
}

/**
 * Ejecutar todos los ejemplos
 */
async function runAllExamples() {
    try {
        await example1_getWeather();
        await example2_withAlerts();
        await example3_detailedForecast();
        await example4_aiIntegration();

        console.log('\n✨ Todos los ejemplos completados\n');
    } catch (error) {
        console.error('❌ Error general:', error.message);
    }
}

// Ejecutar solo si este archivo se corre directamente
if (require.main === module) {
    // Descomentar el ejemplo que quieras ejecutar
    // runAllExamples();
    // example1_getWeather();
    // example2_withAlerts();
    // example3_detailedForecast();
    // example4_aiIntegration();

    // Por defecto, ejecutar el primer ejemplo
    example1_getWeather();
}

module.exports = {
    example1_getWeather,
    example2_withAlerts,
    example3_detailedForecast,
    example4_aiIntegration,
    runAllExamples,
};
