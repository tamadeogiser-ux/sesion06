# 🚀 Quick Start Guide

## 1. Instalación

```bash
# Clonar o descargar el proyecto
cd code_sesion4a

# Instalar dependencias (es mínimo, solo las utilidades)
npm install

# O sin dependencias (solo fetch nativo)
# npm init -y
```

## 2. Primeros Pasos

### Opción A: Ejecutar Ejemplos Incluidos

```bash
# Ejemplo básico
npm run example:basic

# Todos los ejemplos
npm run example:all
```

### Opción B: Usar en Tu Código

```javascript
// 1. Importar el servicio
const weatherService = require('./src/services/weatherService');

// 2. Obtener clima
const result = await weatherService.getWeather({
  latitude: 40.4168,  // Madrid
  longitude: -3.7038
});

// 3. Usar los datos
if (result.success) {
  console.log(result.data.current.temperature);      // 12.5°C
  console.log(result.data.forecast);                 // Array de pronósticos
  console.log(result.summary);                       // "Temperatura actual: 12.5°C..."
}
```

## 3. Estructura del Código

```
src/
├── services/weatherService.js      ← Módulo principal (NO TOCAR)
├── utils/weatherUtils.js           ← Funciones auxiliares
└── examples/
    ├── basicExample.js             ← Para aprender
    ├── advancedExample.js          ← Para producción
    └── responseExample.md          ← Ver ejemplos de respuestas
```

## 4. Casos de Uso Comunes

### ChatBot: Responder sobre el clima

```javascript
const result = await weatherService.getWeather({ latitude, longitude });

// El resumen está en lenguaje natural, perfecto para IA
return result.summary;
// → "Temperatura actual: 12.5°C, Viento: 18.3 km/h. Mañana: máx 15.2°C..."
```

### Alertas: Monitorear condiciones

```javascript
const alerts = weatherService.checkWeatherAlerts(result.data, {
  maxWind: 40,
  minTemperature: 0,
  minPrecipitation: 20
});

if (alerts.length > 0) {
  sendNotification(user, alerts);
}
```

### Dashboard: Mostrar datos bonitos

```javascript
const weatherData = result.data;

// Renderizar en HTML/React/Vue
{
  location: "Madrid",
  current: weatherData.current,
  forecast: weatherData.forecast.slice(0, 7),  // 7 días
}
```

## 5. Documentación Completa

- **README.md**: Guía completa con API reference
- **ARCHITECTURE.md**: Decisiones de diseño y extensiones
- **src/services/weatherService.js**: Código comentado
- **src/utils/weatherUtils.js**: Funciones avanzadas

## 6. Debugging

```javascript
// Ver logs detallados
process.env.DEBUG = 'true';

const { Logger } = require('./src/utils/weatherUtils');
const logger = new Logger('MyApp');

logger.debug('Mi mensaje', { data: '...' });
```

## 7. Próximos Pasos

- [ ] Integrar en tu aplicación
- [ ] Añadir caché Redis para producción
- [ ] Agregar endpoint REST wrapper
- [ ] Conectar con IA para análisis
- [ ] Crear alertas personalizadas

---

¡Listo para usarlo! 🚀
