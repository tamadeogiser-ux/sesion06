# 🌤️ Open-Meteo Weather Integration

Integración profesional y escalable con la API de **Open-Meteo** para Node.js 18+.

Diseñada para:

- 🤖 Agentes de IA y chatbots
- 🔔 Sistemas de alertas automáticas
- 📊 Aplicaciones de análisis meteorológico
- 🔄 Microservicios y automatismos
- 🚀 Producción enterprise

---

## 🚀 Inicio Rápido

### Instalación

```bash
# No requiere dependencias externas (usa fetch nativo)
npm install

# O solo descarga el código
cp src/services/weatherService.js tu-proyecto/
```

### Uso Básico

```javascript
const weatherService = require('./src/services/weatherService');

// Obtener clima
const result = await weatherService.getWeather({
  latitude: 40.4168,  // Madrid
  longitude: -3.7038
});

if (result.success) {
  console.log(result.data.current);        // Datos actuales
  console.log(result.data.forecast);       // Pronóstico
  console.log(result.summary);             // Resumen en lenguaje natural
}
```

---

## 📋 API Referencia

### `getWeather(location, options?)`

Obtiene el clima actual y pronóstico de una ubicación.

**Parámetros:**

- `location` (Object): `{ latitude: number, longitude: number }`
- `options` (Object, opcional): Configuración de parámetros

**Retorna:**

```javascript
{
  success: boolean,
  data: {
    current: { temperature, windSpeed, weatherCode, ... },
    forecast: Array<Day>,
    hourly: Array<Hour>
  },
  summary: string,  // Resumen en lenguaje natural
  error?: string
}
```

**Ejemplo:**

```javascript
const result = await weatherService.getWeather({
  latitude: 40.4168,
  longitude: -3.7038
}, {
  daily: {
    temperature_2m_max: true,
    temperature_2m_min: true,
    precipitation_sum: true
  }
});
```

---

### `checkWeatherAlerts(weatherData, thresholds?)`

Comprueba condiciones meteorológicas y genera alertas.

**Parámetros:**

- `weatherData` (Object): Respuesta de `getWeather().data`
- `thresholds` (Object, opcional): Umbrales personalizados

**Thresholds por defecto:**

```javascript
{
  maxWind: 50,           // km/h
  minTemperature: -10,   // °C
  maxTemperature: 40,    // °C
  minPrecipitation: 10   // mm
}
```

**Retorna:** Array de alertas

```javascript
[
  {
    type: 'HIGH_WIND',
    severity: 'warning',
    message: 'Viento fuerte: 55 km/h',
    value: 55
  }
]
```

**Ejemplo:**

```javascript
const alerts = weatherService.checkWeatherAlerts(
  result.data,
  { maxWind: 40, minTemperature: 0 }
);

alerts.forEach(alert => {
  console.log(`[${alert.severity}] ${alert.message}`);
});
```

---

### `generateWeatherSummary(weatherData)`

Genera resumen meteorológico en lenguaje natural.

**Retorna:** String

```
"Temperatura actual: 12.5°C, Viento: 18.3 km/h. Mañana: máx 15.2°C, mín 8.1°C."
```

---

## 🏗️ Arquitectura

### Separación de Responsabilidades

```
weatherService.js
├── buildWeatherUrl()        → Construcción de URL y validación
├── fetchWeatherData()       → Llamada HTTP con retry
├── parseWeatherResponse()   → Normalización de datos
├── generateWeatherSummary() → Resumen en lenguaje natural
├── checkWeatherAlerts()     → Lógica de alertas
└── getWeather()             → API Principal
```

### Flujo de Datos

```
Usuario
   ↓
getWeather(location)
   ├→ buildWeatherUrl()           [Validar y construir URL]
   ├→ fetchWeatherData()          [HTTP con timeout y retry]
   ├→ parseWeatherResponse()      [Normalizar respuesta]
   ├→ generateWeatherSummary()    [Crear resumen]
   └→ return { success, data, summary }
```

---

## 🔄 Características de Resiliencia

### Timeout

- **10 segundos** por defecto
- Configurable en `CONFIG.TIMEOUT_MS`

### Reintentos

- **2 reintentos** automáticos en caso de timeout
- Backoff exponencial (espera 1s, 2s, 4s...)
- Solo para errores de red, no para errores de la API

### Manejo de Errores

```javascript
// Error HTTP
→ Propaga el error
// Timeout / Network Error
→ Reintenta automáticamente
// Respuesta incompleta
→ Valida estructura
// Coordenadas inválidas
→ Valida antes de la llamada
```

---

## 📊 Datos Disponibles

### Actuales (`current`)

- `temperature`: Temperatura en °C
- `windSpeed`: Velocidad del viento en km/h
- `windDirection`: Dirección del viento en grados
- `weatherCode`: Código meteorológico WMO
- `timezone`: Zona horaria

### Pronóstico Diario (`forecast`)

- `date`: Fecha (YYYY-MM-DD)
- `tempMax` / `tempMin`: Temperatura máxima/mínima
- `precipitation`: Precipitación en mm
- `weatherCode`: Código meteorológico WMO

### Horario (`hourly`)

- `timestamp`: Hora precisa
- `precipitation`: Lluvia en mm
- `windSpeed`: Velocidad del viento en km/h
- `humidity`: Humedad relativa en %

---

## 🎯 Casos de Uso

### 1. Chatbot con Información Meteorológica

```javascript
const { getWeather } = require('./src/services/weatherService');

async function weatherQuery(lat, lon) {
  const result = await getWeather({ latitude: lat, longitude: lon });
  return result.summary;  // Respuesta en lenguaje natural
}

// Usuario: "¿Qué tiempo hace en Madrid?"
// Bot: "Temperatura actual: 12.5°C, Viento: 18.3 km/h. Mañana: máx 15.2°C..."
```

### 2. Sistema de Alertas

```javascript
const alerts = checkWeatherAlerts(result.data, {
  maxWind: 60,
  minTemperature: 5,
  minPrecipitation: 20
});

if (alerts.some(a => a.severity === 'critical')) {
  sendNotification(user, alerts);
}
```

### 3. Dashboard Meteorológico

```javascript
const weatherData = await getWeather(location);

// Renderizar en frontend
{
  current: weatherData.data.current,
  forecast: weatherData.data.forecast.slice(0, 7),  // 7 días
  summary: weatherData.summary
}
```

### 4. Microservicio para Múltiples Ubicaciones

```javascript
const cities = [
  { name: 'Madrid', lat: 40.4168, lon: -3.7038 },
  { name: 'Barcelona', lat: 41.3851, lon: 2.1734 }
];

const weatherMap = await Promise.all(
  cities.map(c => getWeather({ latitude: c.lat, longitude: c.lon }))
);
```

---

## 🧪 Testing

### Testing Manual

```bash
# Ejecutar ejemplos
npm run example:basic    # Ejemplo básico
npm run example:all      # Todos los ejemplos
```

### Testing Unitario (Setup)

```javascript
// test/weatherService.test.js
const { buildWeatherUrl, parseWeatherResponse } = require('../src/services/weatherService');

test('buildWeatherUrl valida coordenadas', () => {
  expect(() => buildWeatherUrl({ latitude: 91, longitude: 0 }))
    .toThrow('Coordenadas fuera de rango');
});

test('parseWeatherResponse normaliza datos', () => {
  const raw = { /* respuesta cruda */ };
  const parsed = parseWeatherResponse(raw);
  expect(parsed.current).toHaveProperty('temperature');
});
```

---

## 🔮 Mejoras Futuras

### Próximas Versiones

- [ ] Caché con Redis
- [ ] Predicción de eventos extremos con ML
- [ ] Integración con sistemas de alertas (Slack, Email)
- [ ] Dashboard web con Astro
- [ ] Historial de datos meteorológicos
- [ ] Comparativas históricas
- [ ] API GraphQL
- [ ] WebSocket para datos en tiempo real

### Extensibilidad

**Agregar nuevas métricas:**

```javascript
// En buildWeatherUrl()
hourly: {
  precipitation: true,
  windspeed_10m: true,
  relativehumidity_2m: true,
  temperature_2m: true,  // ← Nueva
  snowfall: true         // ← Nueva
}
```

**Agregar nuevos tipos de alertas:**

```javascript
// En checkWeatherAlerts()
if (weatherData.hourly.some(h => h.snowfall > minSnowfall)) {
  alerts.push({
    type: 'HEAVY_SNOW',
    severity: 'critical',
    message: `...`
  });
}
```

---

## 📚 Recursos

- **API Open-Meteo**: <https://open-meteo.com/en/docs>
- **Códigos WMO**: <https://www.wmo.int/en>
- **Node.js Fetch**: <https://nodejs.org/api/fetch.html>
- **Timeouts y Reintentos**: <https://developer.mozilla.org/en-US/docs/Web/API/AbortController>

---

## 📝 Licencia

MIT

---

**Desarrollado para producción enterprise con Node.js 18+**
