/**

* ARQUITECTURA DE LA INTEGRACIÓN OPEN-METEO
*
* Documento de diseño y decisiones arquitectónicas
 */

# 🏗️ Arquitectura de la Integración Open-Meteo

## Visión General

Este proyecto implementa una integración profesional y escalable con la API de Open-Meteo,
diseñada para:

* **Agentes IA y Chatbots**: Proporcionar información meteorológica en lenguaje natural
* **Sistemas de Alertas**: Monitorear condiciones y generar notificaciones
* **Automatismos**: Activar acciones basadas en condiciones meteorológicas
* **Microservicios**: Servir como API interna para aplicaciones
* **Producción Enterprise**: Código robusto, testeable y observable

---

## 📐 Estructura del Proyecto

```
src/
├── services/
│   └── weatherService.js       # Módulo principal (sin dependencias)
├── utils/
│   └── weatherUtils.js         # Utilidades avanzadas (Logger, Caché, etc.)
├── examples/
│   ├── basicExample.js         # Ejemplos de uso
│   └── responseExample.md      # Ejemplos de respuestas
├── tests/                      # (Por implementar)
│   └── weatherService.test.js
└── config/                     # (Por implementar)
    └── index.js

package.json                    # Configuración del proyecto
README.md                        # Documentación principal
```

---

## 🎯 Decisiones Arquitectónicas

### 1. Sin Dependencias Externas

**Decisión**: Usar `fetch` nativo de Node.js 18+

**Por qué**:
* ✅ Reduces vulnerabilidades (menos deps)
* ✅ Mejor rendimiento (sin overhead)
* ✅ Mantenimiento simplificado
* ✅ Compatible con edge/serverless
* ✅ Documentación oficial

**Trade-off**:
* Menos helpers para HTTP (manejable manualmente)

**Si necesitases axios** (para casos complejos):

```javascript
// Solo si: interceptores, transformaciones, etc.
import axios from 'axios';
```

---

### 2. Separación Clara de Responsabilidades

```
┌─────────────────────────────────────────┐
│  getWeather() - API Principal           │
│  (Orquesta todo)                        │
└─────────────────────────────────────────┘
  ↓              ↓              ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
│ buildURL()   │ │ fetchData()  │ │ parseResponse()  │
│ (Validar)    │ │ (HTTP+retry) │ │ (Normalizar)     │
└──────────────┘ └──────────────┘ └──────────────────┘
                          ↓
                  ┌──────────────────┐
                  │ generateSummary()│
                  │ (IA-friendly)    │
                  └──────────────────┘
```

**Beneficios**:
* Cada función testeable independientemente
* Fácil de extender o reemplazar
* Código legible y mantenible

---

### 3. Manejo de Errores Profesional

**Estrategia en 3 capas**:

```javascript
1️⃣ VALIDACIÓN (buildWeatherUrl)
   → Detecta problemas antes de hacer la llamada
   → Fast-fail sin consumir recursos

2️⃣ RESILIENCIA (fetchWeatherData)
   → Timeout: 10 segundos
   → Reintentos: 2 automáticos
   → Backoff exponencial
   → NO reintenta errores HTTP (400, 403, etc.)

3️⃣ NORMALIZACIÓN (parseWeatherResponse)
   → Valida estructura de respuesta
   → Maneja datos faltantes
   → Convierte a formato consistente
```

---

### 4. Caché Local (Extensible a Redis)

```javascript
// Implementación actual: Map + TTL
const cache = new WeatherCache(600); // 10 minutos

// Extensión futura: Redis
// const cache = new RedisWeatherCache(redisClient, 600);
```

**Por qué**:
* Reduce latencia (datos locales vs red)
* Ahorra cuota API (Open-Meteo es generosa, pero límites existen)
* Mejora experiencia usuario (respuestas rápidas)
* Permite offline parcial

---

### 5. Generación de Resumen en Lenguaje Natural

```javascript
generateWeatherSummary(weatherData)
→ "Temperatura actual: 12.5°C, Viento: 18.3 km/h. Mañana: máx 15.2°C..."
```

**Propósito**:
* 🤖 Para chatbots/IA (input directo)
* 📱 Para notificaciones push
* 📊 Para reports automáticos

---

## 🔄 Flujos de Datos

### Flujo Normal (Happy Path)

```
getWeather({ lat, lon })
    ↓
✅ Validar coordenadas
    ↓
🔗 buildWeatherUrl()
    ↓
📡 fetchWeatherData()
    ├→ Timeout: 10s
    ├→ Reintento: 2x
    └→ Backoff exponencial
    ↓
✅ HTTP 200
    ↓
📦 parseWeatherResponse()
    ├→ Normalizar campos
    ├→ Convertir unidades
    └→ Validar estructura
    ↓
💬 generateWeatherSummary()
    ↓
✅ return { success: true, data, summary }
```

### Flujo Error (HTTP 400)

```
fetchWeatherData()
    ↓
❌ HTTP 400 (Mala solicitud)
    ↓
❌ NO reintenta (es culpa del cliente)
    ↓
❌ Propaga error
    ↓
❌ return { success: false, error: "...", data: null }
```

### Flujo Error (Timeout)

```
fetchWeatherData()
    ↓
⏱️ Timeout 10s
    ↓
🔄 Reintento #1 (espera 1s)
    ↓
⏱️ Timeout 10s
    ↓
🔄 Reintento #2 (espera 2s)
    ↓
⏱️ Timeout 10s
    ↓
❌ Agota reintentos
    ↓
❌ return { success: false, error: "timeout", data: null }
```

---

## 📊 Observabilidad

### Logs Estructurados

```javascript
const logger = new Logger('WeatherService');

logger.info('Fetching weather', { lat: 40.4168, lon: -3.7038 });
logger.warn('Retry attempt', { retry: 1, url: '...' });
logger.error('API Error', { status: 503, message: '...' });
logger.debug('Parsed response', { current, forecast });
```

### Métricas

```javascript
const metrics = new MetricsCollector();

// Después de cada llamada:
metrics.recordRequest(responseTimeMs, success);

// Obtener dashboard:
metrics.getMetrics()
→ {
    requestCount: 156,
    successCount: 150,
    errorCount: 6,
    successRate: 96.15%,
    averageResponseTime: 245ms
  }
```

---

## 🔐 Seguridad

### Validaciones

```javascript
✅ Coordenadas válidas (-90..90, -180..180)
✅ Tipos correctos (number, string, etc.)
✅ Estructura de respuesta validada
✅ No exponemos URLs internas
✅ Timeout para prevenir DoS
```

### No Implementado (Pero Preparado)

```javascript
// Añadir si necesitas:
- Rate limiting (clientes)
- Autenticación (API interna)
- Encriptación de caché
- Logs de auditoría
```

---

## 🧪 Testabilidad

### Funciones Puras

```javascript
// ✅ Testeable - sin side effects
const url = buildWeatherUrl({ latitude: 40, longitude: -3 });
assert(url.includes('latitude=40'));

// ✅ Testeable - entrada/salida predecible
const parsed = parseWeatherResponse(mockResponse);
assert(parsed.current.temperature === 12.5);
```

### Inyección de Dependencias

```javascript
// Futuro: permitir inyectar logger, caché, etc.
getWeather(location, options, {
  logger: customLogger,
  cache: redisCache,
  fetch: mockFetch  // Para testing
})
```

---

## 🚀 Escalabilidad

### Crecimiento Horizontal

```javascript
// Ahora: Una instancia
const weather = new WeatherService();

// Futuro: Múltiples instancias con caché compartida (Redis)
const weather1 = new WeatherService({ cache: redisClient });
const weather2 = new WeatherService({ cache: redisClient });
```

### Crecimiento Vertical

```javascript
// Ahora: Una ubicación por vez
getWeather(location)

// Futuro: Batch processing
getBatch([loc1, loc2, loc3])  // Paralelo con Promise.all()
```

---

## 📈 Mejoras Roadmap

### Phase 1: Observabilidad (Próximas)

- [ ] Logging con Winston/Pino
* [ ] Métricas con Prometheus
* [ ] Tracing con OpenTelemetry

### Phase 2: Caché Distribuida

- [ ] Redis como backend
* [ ] Invalidación inteligente
* [ ] Estadísticas de acierto

### Phase 3: IA Integration

- [ ] Embeddings meteorológicos
* [ ] Predicción con ML
* [ ] Alertas inteligentes

### Phase 4: API Gateway

- [ ] REST API wrapper
* [ ] GraphQL
* [ ] WebSockets tiempo real

---

## 📝 Referencias Técnicas

### Open-Meteo API

- Docs: <https://open-meteo.com/en/docs>
* Endpoint: <https://api.open-meteo.com/v1/forecast>
* Rate Limit: Generoso (sin autenticación)
* Latencia: ~200-300ms típico

### Node.js Fetch

- Disponible: Node 18+
* API: Estándar web (igual a navegadores)
* Docs: <https://nodejs.org/api/fetch.html>

### Estándares

- Códigos WMO: <https://www.wmo.int/en>
* ISO 8601 para fechas/horas
* RFC 7231 para headers HTTP

---

## 👤 Principios de Diseño

**Simplicidad**
> "El código más simple que funciona es el mejor código"

**Claridad**
> "Código legible por otros desarrolladores (incluyéndome en 6 meses)"

**Resiliencia**
> "Pensar en edge cases desde el inicio"

**Extensibilidad**
> "Nuevo capaz de crecer sin refactor mayor"

**Producción**
> "Código listo para servir 1000 requests/segundo"

---

Última actualización: Diciembre 2025
Versión: 1.0.0-beta
