/**
 * Backend Weather Server
 * 
 * API REST para datos meteorológicos
 * - Endpoint de búsqueda de ciudades
 * - Endpoint de clima actual
 * - Endpoint de pronóstico
 * - CORS habilitado para frontend
 */

import http from 'http';
import { getWeather } from './src/services/weatherService.js';

const PORT = 3000;

// Base de datos de ciudades con coordenadas
const CITIES_DATABASE = [
    // España
    { name: 'Madrid', lat: 40.4168, lon: -3.7038, country: 'ES' },
    { name: 'Barcelona', lat: 41.3851, lon: 2.1734, country: 'ES' },
    { name: 'Valencia', lat: 39.4699, lon: -0.376, country: 'ES' },
    { name: 'Sevilla', lat: 37.3886, lon: -5.9823, country: 'ES' },
    { name: 'Bilbao', lat: 43.2627, lon: -2.9355, country: 'ES' },
    { name: 'Málaga', lat: 36.7213, lon: -3.7437, country: 'ES' },
    { name: 'Palma', lat: 39.5696, lon: 2.6502, country: 'ES' },
    { name: 'Alicante', lat: 38.3452, lon: -0.4810, country: 'ES' },
    { name: 'Córdoba', lat: 37.8882, lon: -4.7794, country: 'ES' },
    { name: 'Murcia', lat: 37.9922, lon: -1.1307, country: 'ES' },

    // Europa
    { name: 'Nueva York', lat: 40.7128, lon: -74.006, country: 'US' },
    { name: 'Londres', lat: 51.5074, lon: -0.1278, country: 'UK' },
    { name: 'París', lat: 48.8566, lon: 2.3522, country: 'FR' },
    { name: 'Berlín', lat: 52.52, lon: 13.405, country: 'DE' },
    { name: 'Ámsterdam', lat: 52.3676, lon: 4.9041, country: 'NL' },
    { name: 'Roma', lat: 41.9028, lon: 12.4964, country: 'IT' },
    { name: 'Viena', lat: 48.2082, lon: 16.3738, country: 'AT' },
    { name: 'Praga', lat: 50.0755, lon: 14.4378, country: 'CZ' },
    { name: 'Estambul', lat: 41.0082, lon: 28.9784, country: 'TR' },
    { name: 'Moscú', lat: 55.7558, lon: 37.6173, country: 'RU' },

    // América Latina
    { name: 'Ciudad de México', lat: 19.4326, lon: -99.1332, country: 'MX' },
    { name: 'Buenos Aires', lat: -34.6037, lon: -58.3816, country: 'AR' },
    { name: 'São Paulo', lat: -23.5505, lon: -46.6333, country: 'BR' },
    { name: 'Bogotá', lat: 4.7110, lon: -74.0721, country: 'CO' },
    { name: 'Lima', lat: -12.0464, lon: -77.0428, country: 'PE' },
];

/**
 * Busca ciudades por nombre
 * @param {string} query - Término de búsqueda
 * @param {number} limit - Máximo de resultados
 * @returns {Array} Array de ciudades coincidentes
 */
function searchCities(query, limit = 10) {
    if (!query || query.length < 1) return [];

    const lowerQuery = query.toLowerCase();
    return CITIES_DATABASE
        .filter(city => city.name.toLowerCase().includes(lowerQuery))
        .slice(0, limit);
}

/**
 * Handler de peticiones HTTP
 */
async function requestHandler(req, res) {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = requestUrl.pathname;
    const query = Object.fromEntries(requestUrl.searchParams.entries());

    // Log de request
    console.log(`[${new Date().toISOString()}] ${req.method} ${pathname}`, query);

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // Manejo de preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    try {
        // RUTA: GET /api/cities/search?q=madrid
        if (pathname === '/api/cities/search' && req.method === 'GET') {
            const searchQuery = query.q || '';
            const results = searchCities(searchQuery, 10);

            res.writeHead(200);
            res.end(JSON.stringify({
                success: true,
                data: results,
                query: searchQuery,
            }));
            return;
        }

        // RUTA: GET /api/weather?lat=40.4168&lon=-3.7038
        if (pathname === '/api/weather' && req.method === 'GET') {
            const lat = parseFloat(query.lat);
            const lon = parseFloat(query.lon);
            const cityName = query.city || 'Ubicación';

            if (isNaN(lat) || isNaN(lon)) {
                res.writeHead(400);
                res.end(JSON.stringify({
                    success: false,
                    error: 'Parámetros lat y lon requeridos',
                }));
                return;
            }

            // Llamar al servicio de clima (usa lógica compartida, cache y alertas)
            const result = await getWeather({ latitude: lat, longitude: lon }, {
                // Podemos pasar opciones adicionales si fuera necesario
            });

            if (result.success) {
                // Inyectamos el nombre de la ciudad en la data normalizada
                result.data.cityName = cityName;

                res.writeHead(200);
                res.end(JSON.stringify(result));
            } else {
                res.writeHead(500);
                res.end(JSON.stringify({
                    success: false,
                    error: result.error || 'Error fetching weather data',
                }));
            }
            return;
        }

        // RUTA: GET /api/health
        if (pathname === '/api/health') {
            res.writeHead(200);
            res.end(JSON.stringify({
                success: true,
                message: 'Weather API is running',
                timestamp: new Date().toISOString(),
            }));
            return;
        }

        // 404
        res.writeHead(404);
        res.end(JSON.stringify({
            success: false,
            error: 'Ruta no encontrada',
            path: pathname,
        }));

    } catch (error) {
        console.error('Error en request:', error);
        res.writeHead(500);
        res.end(JSON.stringify({
            success: false,
            error: error.message,
        }));
    }
}

// Crear servidor
const server = http.createServer(requestHandler);

// Si se ejecuta directamente (node server.js), iniciar el servidor
if (process.argv[1] === import.meta.filename) {
    server.listen(PORT, () => {
        console.log(`
╔════════════════════════════════════════╗
║  🌤️  Weather API Server                ║
║                                        ║
║  http://localhost:${PORT}               ║
║                                        ║
║  Endpoints:                            ║
║  GET /api/health                       ║
║  GET /api/cities/search?q=madrid       ║
║  GET /api/weather?lat=40&lon=-3        ║
╚════════════════════════════════════════╝
      `);
    });

    server.on('error', (err) => {
        console.error('Server error:', err);
        process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n\nShutting down gracefully...');
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });

        // Force exit after 10 segundos
        setTimeout(() => {
            console.error('Force closing...');
            process.exit(1);
        }, 10000);
    });
}

// Exportar request handler para testing
export { requestHandler };
