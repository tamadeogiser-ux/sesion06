# Documentación de Pruebas (QA)

Este documento detalla la estrategia de pruebas implementada en el proyecto, cubriendo tanto los aspectos técnicos como los casos de uso validados.

## Resumen de Ejecución

Actualmente, el proyecto cuenta con un conjunto de pruebas robusto que cubre tanto el Backend como la lógica crítica del Frontend.

**Estado Actual:**

- **Total Test Suites:** 5 passed (4 Backend + 1 Frontend)
- **Total Tests:** 29 passed (25 Backend + 4 Frontend)
- **Snapshots:** 0 total
- **Time:** ~2s

---

## 🛠️ Infraestructura de Pruebas

El sistema utiliza una estrategia híbrida:

1. **Backend:** **Jest** (ESM nativo).
2. **Frontend:** **Vitest** (Optimizado para Vite/Astro).

- **Backend:** `npm test` (desde la raíz)
- **Frontend:** `cd web && npx vitest run`

---

## 📂 Detalle de Pruebas Backend

Las pruebas se dividen en **Unitarias** (lógica aislada) y de **Integración** (API completa).

### 1. Suite de Servicios (`weatherService.test.js`)

Valida la orquestación principal de la obtención de datos climáticos.

| Función Probada | Caso de Uso | Estado |
|-----------------|-------------|---------|
| `buildWeatherUrl` | Construcción de URL con parámetros lat/long correctos. | ✅ Pasó |
| | Validación de errores si faltan coordenadas. | ✅ Pasó |
| `checkWeatherAlerts` | Detección de alertas por viento fuerte (>70 km/h). | ✅ Pasó |
| | Detección de alertas por temperaturas extremas (>35°C, <0°C). | ✅ Pasó |
| `getWeather` | Flujo completo exitoso obteniendo datos y retornando estructura validada. | ✅ Pasó |
| | Manejo de errores de red o API caída. | ✅ Pasó |

### 2. Suite de Utilidades (`weatherUtils.test.js`)

Pruebas de funciones puras y lógica de negocio auxiliar.

| Función Probada | Caso de Uso | Estado |
|-----------------|-------------|---------|
| `getActivityRecommendations` | Recomienda actividades outdoor con buen clima. | ✅ Pasó |
| | Advierte sobre hielo/conducción con temperaturas bajo cero. | ✅ Pasó |
| `calculateHeatIndex` | Cálculo correcto de sensación térmica basado en humedad. | ✅ Pasó |
| `MetricsCollector` | Recolección de métricas de rendimiento (latencia). | ✅ Pasó |

### 3. Suite de Mocks Avanzados (`advancedMocks.test.js`)

Validación de comportamientos dependientes del entorno y utilidades del sistema.

| Característica | Caso de Uso | Tipo de Mock |
|----------------|-------------|--------------|
| **Environment Vars** | Logger solo imprime si `process.env.DEBUG=true`. | `process.env` |
| **Spies** | Verificación de llamadas a `console.log` y `console.warn`. | `jest.spyOn` |
| **Timers** | Simulación de reintentos (Retries) manipulando el tiempo. | `jest.useFakeTimers` |

### 4. Suite de Integración API (`api.test.js`)

Pruebas "black-box" sobre los endpoints HTTP utilizando `supertest`. Levanta un servidor real en memoria.

| Endpoint | Verificación | Estado |
|----------|--------------|---------|
| `GET /api/health` | Retorna 200 OK y estado del servicio. | ✅ Pasó |
| `GET /api/cities/search` | Búsqueda exitosa de ciudades (ej. "Madrid"). | ✅ Pasó |
| | Manejo de búsquedas vacías o sin resultados. | ✅ Pasó |
| `GET /api/weather` | Retorna datos con la estructura correcta (incluyendo `alerts`). | ✅ Pasó |
| | Validación de parámetros obligatorios (400 Bad Request). | ✅ Pasó |

---

## 🎨 Detalle de Pruebas Frontend

El frontend implementa pruebas unitarias para asegurar la resiliencia de la UI ante datos externos.

### 1. Suite de Lógica UI (`weatherMapper.test.js`)

Valida la capa de adaptación ("Adapter Pattern") entre la API REST y los componentes visuales de Astro.

| Función Probada | Caso de Uso | Estado |
|-----------------|-------------|---------|
| `generateFallbackData` | Garantiza que la UI muestre datos ("Mock Valencia") si falla el servidor. | ✅ Pasó |
| | Estructura de objetos (current, forecast, alerts) consistente. | ✅ Pasó |
| `formatWeatherData` | Mapeo de códigos WMO (ej. 0 -> "Despejado", 71 -> "Nieve"). | ✅ Pasó |
| | Normalización de nulos (Null Safety) para evitar crashes en componentes. | ✅ Pasó |

---

> **Nota para desarrolladores:**
>
> - **Backend:** Añadir tests en `tests/`.
> - **Frontend:** Añadir tests en `web/tests/`.
