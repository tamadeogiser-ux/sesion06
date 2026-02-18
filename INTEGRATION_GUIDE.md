# 🔗 Guía de Integración Frontend + Backend

## Visión General

Este documento explica cómo conectar el **frontend Astro** con el **backend Node.js** para crear una aplicación meteorológica funcional completa.

---

## 📋 Estructura de Carpetas

```
code_sesion4a/
├── src/                    ← Backend Node.js
│   ├── services/
│   │   └── weatherService.js
│   ├── examples/
│   └── utils/
│
└── web/                    ← Frontend Astro
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── layouts/
    │   └── styles/
    └── public/
```

---

## 🚀 Paso 1: Configurar el Backend

### 1.1 Instalar dependencias

```bash
cd code_sesion4a
npm install
```

### 1.2 Crear archivo `src/server.js`

```javascript
/**
 * Servidor API simple para servir weatherService
 */

import weatherService from './services/weatherService.js';

const PORT = 3001;
const API_URL = `http://localhost:${PORT}`;

// Función simple para parsear query string
function parseQueryString(url) {
  const params = new URLSearchParams(new URL(url, 'http://localhost').search);
  return Object.fromEntries(params);
}

// Crear servidor HTTP
const server = await import('http').then(http => {
  return http.createServer(async (req, res) => {
    // Headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // Preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    try {
      // GET /api/weather?latitude=40.4168&longitude=-3.7038
      if (req.method === 'GET' && req.url.startsWith('/api/weather')) {
        const params = parseQueryString(req.url);
        const { latitude, longitude } = params;

        if (!latitude || !longitude) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Missing latitude or longitude' }));
          return;
        }

        const result = await weatherService.getWeather({
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        });

        res.writeHead(result.success ? 200 : 400);
        res.end(JSON.stringify(result));
      }
      // POST /api/alerts
      else if (req.method === 'POST' && req.url === '/api/alerts') {
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
          const { latitude, longitude, thresholds } = JSON.parse(body);
          
          // Obtener clima
          weatherService.getWeather({ latitude, longitude }).then(result => {
            if (result.success) {
              const alerts = weatherService.checkWeatherAlerts(
                result.data,
                thresholds
              );
              res.writeHead(200);
              res.end(JSON.stringify({ success: true, alerts }));
            } else {
              res.writeHead(400);
              res.end(JSON.stringify(result));
            }
          });
        });
      }
      // 404
      else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    } catch (error) {
      console.error('Server error:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n✅ API Server running at ${API_URL}`);
  console.log(`\nEndpoints:`);
  console.log(`  GET  /api/weather?latitude=40.4168&longitude=-3.7038`);
  console.log(`  POST /api/alerts`);
  console.log(`\n`);
});
```

### 1.3 Ejecutar el servidor

```bash
node src/server.js

# Output:
# ✅ API Server running at http://localhost:3001
```

---

## 🎨 Paso 2: Configurar el Frontend

### 2.1 Instalar dependencias

```bash
cd web
npm install
```

### 2.2 Crear archivo `web/src/utils/api.js`

```javascript
/**
 * Cliente API para comunicarse con el backend
 */

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchWeather(latitude, longitude) {
  try {
    const url = `${API_BASE}/api/weather?latitude=${latitude}&longitude=${longitude}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching weather:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

export async function fetchAlerts(latitude, longitude, thresholds = {}) {
  try {
    const response = await fetch(`${API_BASE}/api/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude, thresholds }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return { success: false, error: error.message, alerts: [] };
  }
}
```

### 2.3 Configurar variable de entorno

```bash
# web/.env
PUBLIC_API_URL=http://localhost:3001
```

### 2.4 Actualizar `web/src/components/LocationSearch.astro`

```astro
<script>
  import { fetchWeather } from '../utils/api.js';
  
  // ... código existente ...
  
  // Cuando se selecciona una ubicación
  document.addEventListener('locationSelected', async (e) => {
    const { latitude, longitude } = e.detail;
    
    // Mostrar loading
    const main = document.querySelector('main');
    const loading = document.createElement('div');
    loading.textContent = '⏳ Cargando...';
    loading.id = 'loading-indicator';
    main?.appendChild(loading);
    
    // Fetch weather
    const result = await fetchWeather(latitude, longitude);
    
    // Eliminar loading
    loading.remove();
    
    if (result.success) {
      // Actualizar UI con nuevos datos
      window.dispatchEvent(new CustomEvent('weatherUpdated', {
        detail: result.data
      }));
    } else {
      // Mostrar error
      alert(`Error: ${result.error}`);
    }
  });
</script>
```

### 2.5 Actualizar `web/src/pages/index.astro`

```astro
---
// Al inicio del archivo
// Mock data como fallback
const mockWeatherData = {
  // ... datos de ejemplo ...
};
---

<Layout>
  <!-- Componentes existentes -->
  <LocationSearch placeholder="Busca una ciudad..." />
  
  <!-- Contenedor dinámico para datos -->
  <div id="weather-container">
    <CurrentWeather
      temperature={mockWeatherData.current.temperature}
      description={mockWeatherData.current.description}
      humidity={mockWeatherData.current.humidity}
      windSpeed={mockWeatherData.current.windSpeed}
      feelsLike={mockWeatherData.current.feelsLike}
    />
  </div>
  
  <!-- Script para actualizar -->
  <script>
    window.addEventListener('weatherUpdated', (e) => {
      const data = e.detail;
      const container = document.getElementById('weather-container');
      
      if (container && data) {
        // Recrear HTML con nuevos datos
        // O usar Astro.rerender() si está disponible
        location.reload(); // Solución temporal
      }
    });
  </script>
</Layout>
```

---

## ⚡ Paso 3: Ejecutar en Desarrollo

### Terminal 1: Backend

```bash
cd code_sesion4a
node src/server.js
# → http://localhost:3001
```

### Terminal 2: Frontend

```bash
cd code_sesion4a/web
npm run dev
# → http://localhost:3000
```

### Verificar Funcionamiento

1. Abrir: <http://localhost:3000>
2. Escribir una ciudad en el buscador (e.g., "Madrid")
3. Ver si los datos se cargan desde la API
4. Verificar en DevTools que las llamadas van a `localhost:3001/api/weather`

---

## 🔍 Debugging

### Verificar endpoint del backend

```bash
curl "http://localhost:3001/api/weather?latitude=40.4168&longitude=-3.7038"
```

### Ver logs del frontend

```javascript
// En console del navegador
fetch('http://localhost:3001/api/weather?latitude=40.4168&longitude=-3.7038')
  .then(r => r.json())
  .then(console.log)
```

### Verificar CORS

Si ves error de CORS, el backend tiene headers correctos en `src/server.js`

---

## 🚀 Paso 4: Deploy a Producción

### Backend a Heroku

```bash
cd code_sesion4a
npm install -g heroku-cli
heroku login
heroku create my-weather-api
git push heroku main
```

### Frontend a Vercel

```bash
cd code_sesion4a/web
npm install -g vercel
vercel
# → Seleccionar Astro como framework
# → Configurar PUBLIC_API_URL a https://my-weather-api.herokuapp.com
```

---

## 📝 Variables de Entorno

### Backend (.env)

```
PORT=3001
NODE_ENV=production
API_TIMEOUT=10000
```

### Frontend (web/.env)

```
PUBLIC_API_URL=https://my-weather-api.herokuapp.com
```

---

## ✅ Checklist de Integración

- [ ] Backend instalado y funcionando
- [ ] Frontend instalado y funcionando
- [ ] Cliente API (`api.js`) creado
- [ ] Llamadas HTTP funcionan
- [ ] Datos se muestran en UI
- [ ] Dark mode funciona
- [ ] Búsqueda funciona
- [ ] Alertas se muestran
- [ ] Sin errores en console
- [ ] Build producción sin errores
- [ ] Lighthouse score > 90

---

## 🎓 Mejoras Siguientes

1. **Persistencia**: Agregar BD para historial de búsquedas
2. **Caché**: Implementar Redis en backend
3. **Validación**: Agregar zod/joi para schemas
4. **Testing**: Jest para tests unitarios
5. **Analytics**: Tracking de eventos
6. **Observabilidad**: Logging centralizado
7. **Security**: Rate limiting, CORS avanzado

---

¡Listo para integrar frontend y backend! 🚀
