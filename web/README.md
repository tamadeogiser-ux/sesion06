# 🌤️ Frontend Weather App - Guía Técnica

## Visión General

Frontend profesional construido con **Astro**, **Tailwind CSS** y **CSS personalizado**.

Diseño: **HTML-first**, **mobile-first**, **accesible** (WCAG 2.2), **dark mode**.

---

## 🏗️ Arquitectura

```
web/
├── src/
│   ├── components/          # Componentes Astro reutilizables
│   │   ├── Header.astro              [Navegación principal + theme toggle]
│   │   ├── CurrentWeather.astro      [Tarjeta clima actual]
│   │   ├── ForecastCard.astro        [Tarjeta pronóstico diario]
│   │   ├── AlertBanner.astro         [Alertas meteorológicas]
│   │   └── LocationSearch.astro      [Input búsqueda de ciudades]
│   │
│   ├── layouts/
│   │   └── Layout.astro              [Layout base para todas las páginas]
│   │
│   ├── pages/
│   │   └── index.astro               [Página principal]
│   │
│   └── styles/
│       ├── tokens.css                [Variables de diseño]
│       ├── components.css            [Clases reutilizables]
│       └── global.css                [Punto de entrada CSS]
│
├── public/                  # Assets estáticos
├── astro.config.mjs        # Configuración Astro
├── tailwind.config.mjs     # Configuración Tailwind
└── package.json            # Dependencias mínimas
```

---

## 🎨 Componentes

### Header.astro

Navegación sticky con toggle de tema oscuro/claro.

**Features:**

- Theme toggle con localStorage persistence
- Sincroniza entre pestañas
- Respeta `prefers-color-scheme`
- Accesible (ARIA)

```astro
<Header title="Mi App" />
```

### CurrentWeather.astro

Tarjeta grande mostrando clima actual.

**Props:**

- `temperature: number` - Temperatura actual
- `description: string` - Descripción (e.j. "Parcialmente nublado")
- `humidity?: number` - Humedad en %
- `windSpeed?: number` - Velocidad en km/h
- `feelsLike?: number` - Sensación térmica

**Features:**

- Icono animado flotante
- Gradient background
- Detalles adicionales (humedad, viento, sensación)

```astro
<CurrentWeather
  temperature={12.5}
  description="Parcialmente nublado"
  humidity={65}
  windSpeed={18.3}
  feelsLike={11.2}
/>
```

### ForecastCard.astro

Tarjeta para pronóstico de un día.

**Props:**

- `date: string` - Fecha (YYYY-MM-DD)
- `tempMax: number` - Temperatura máxima
- `tempMin: number` - Temperatura mínima
- `precipitation: number` - Lluvia esperada (mm)
- `description?: string` - Descripción del clima

**Features:**

- Barra de temperatura con gradiente
- Formato de fecha localizado
- Icono según tipo de clima
- Indicador de precipitación

```astro
<ForecastCard
  date="2025-12-22"
  tempMax={15.2}
  tempMin={8.1}
  precipitation={2.3}
  description="Lluvia moderada"
/>
```

### AlertBanner.astro

Banner para mostrar alertas meteorológicas.

**Props:**

- `type: 'info' | 'success' | 'warning' | 'error'` - Severidad
- `title: string` - Título de alerta
- `message: string` - Mensaje detallado
- `icon?: string` - Icono personalizado
- `dismissible?: boolean` - Puede cerrarse

**Features:**

- Colores según tipo
- Icono y animación de entrada
- Cierre opcional
- ARIA roles correctos

```astro
<AlertBanner
  type="warning"
  title="Lluvia esperada"
  message="Se esperan precipitaciones mañana"
  dismissible={true}
/>
```

### LocationSearch.astro

Input para buscar y seleccionar ubicaciones.

**Features:**

- Autocomplete con ciudades predefinidas
- Filtrado en tiempo real
- Sin dependencias externas
- Despacha evento personalizado

**Event:**

```javascript
window.addEventListener('locationSelected', (e) => {
  const { latitude, longitude } = e.detail;
});
```

---

## 🎯 Datos Principales a Mostrar

Según el backend, los datos más importantes son:

1. **Temperatura actual** (prominente)
2. **Descripción meteorológica** (e.j. "Nublado")
3. **Sensación térmica** (feels like)
4. **Humedad relativa**
5. **Velocidad del viento**
6. **Pronóstico de 7 días** (máx, mín, precipitación)
7. **Alertas meteorológicas** (si las hay)

---

## 🎨 Sistema de Diseño (Design Tokens)

### Colores

```css
/* Primarios */
--color-bg-primary: #ffffff
--color-text-primary: #0f172a

/* Dark Mode */
.dark {
  --color-bg-primary: #0f172a
  --color-text-primary: #f1f5f9
}

/* Semántica */
--color-success: #22c55e
--color-warning: #eab308
--color-error: #ef4444
--color-info: #0ea5e9

/* Gradientes */
--gradient-primary: linear-gradient(135deg, #0ea5e9, #0284c7)
```

### Espaciado (escala 4px)

```css
--space-xs: 0.25rem    /* 4px */
--space-sm: 0.5rem     /* 8px */
--space-md: 1rem       /* 16px */
--space-lg: 1.5rem     /* 24px */
--space-xl: 2rem       /* 32px */
--space-2xl: 3rem      /* 48px */
--space-3xl: 4rem      /* 64px */
```

### Tipografía

```css
--font-size-xs: 0.75rem    /* 12px */
--font-size-sm: 0.875rem   /* 14px */
--font-size-base: 1rem     /* 16px */
--font-size-lg: 1.125rem   /* 18px */
--font-size-xl: 1.25rem    /* 20px */
--font-size-2xl: 1.5rem    /* 24px */
--font-size-3xl: 1.875rem  /* 30px */
--font-size-4xl: 2.25rem   /* 36px */

/* Pesos */
--font-weight-regular: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
```

### Bordes y Sombras

```css
--radius-sm: 0.375rem      /* 6px */
--radius-md: 0.5rem        /* 8px */
--radius-lg: 0.75rem       /* 12px */
--radius-xl: 1rem          /* 16px */
--radius-2xl: 1.5rem       /* 24px */

--shadow-sm: 0 1px 2px
--shadow-md: 0 4px 6px -1px
--shadow-lg: 0 10px 15px -3px
--shadow-xl: 0 20px 25px -5px
```

---

## ⚙️ Configuración

### Astro (`astro.config.mjs`)

- Integración Tailwind CSS
- Renderizado estático
- Compatible con SSR

### Tailwind (`tailwind.config.mjs`)

- Colores personalizados
- Tipografía (Inter, Poppins)
- Animaciones
- Dark mode class-based
- Responsive mobile-first

---

## 🔧 JavaScript Encapsulado

### Header - Theme Toggle

```javascript
// src/components/Header.astro
- Detecta preferencia del sistema
- Persiste en localStorage
- Sincroniza entre pestañas
- Sin framework externo
```

### LocationSearch - Autocomplete

```javascript
// src/components/LocationSearch.astro
- Filtrado en tiempo real
- Resultados con click
- Despacha evento personalizado: 'locationSelected'
- Cierre al hacer click fuera
```

**Uso:**

```javascript
window.addEventListener('locationSelected', (e) => {
  const { latitude, longitude } = e.detail;
  // Hacer llamada a la API
  fetchWeatherData(latitude, longitude);
});
```

---

## 📱 Responsive Design

### Breakpoints

```css
Mobile:   < 640px
Tablet:   640px - 1024px
Desktop:  > 1024px
```

### Implementación

Todos los componentes usan:

- `grid-template-columns: repeat(auto-fit, minmax(...))`
- Media queries para layouts
- `clamp()` para tipografía fluida

```css
h1 {
  font-size: clamp(1.75rem, 5vw, 3rem);
}
```

---

## ♿ Accesibilidad (WCAG 2.2)

### Implementado

- ✅ **Colores:** Suficiente contraste
- ✅ **Navegación:** Tecla Tab funcional
- ✅ **Focus:** `focus-visible` en todos los interactivos
- ✅ **ARIA:** Roles semánticos (`alert`, `button`, `listbox`)
- ✅ **Semantics:** `<h1>`, `<nav>`, `<main>`, `<article>`
- ✅ **Dark Mode:** `prefers-color-scheme` respetado
- ✅ **Motion:** `prefers-reduced-motion` soportado

---

## 🚀 Scripts

```bash
# Desarrollo
npm run dev

# Build (producción)
npm run build

# Preview de build
npm run preview

# CLI de Astro
npm run astro
```

---

## 📦 Dependencias Mínimas

```json
{
  "astro": "^4.0.0",
  "@astrojs/tailwind": "^0.2.0",
  "tailwindcss": "^3.3.0"
}
```

**Sin frontend frameworks** (React, Vue, Svelte).
JavaScript vanilla solo donde es necesario.

---

## 🎯 Mejoras Futuras

### Phase 1: Funcionalidad

- [ ] Integración real con backend
- [ ] Geolocalización automática
- [ ] Historial de búsquedas
- [ ] Favoritos/guardados

### Phase 2: UX

- [ ] Animaciones avanzadas
- [ ] Transiciones entre vistas
- [ ] Loading skeletons
- [ ] Swiper para móvil

### Phase 3: Features

- [ ] Alertas personalizadas
- [ ] Notificaciones push
- [ ] Widgets/Dashboard
- [ ] Exportar datos

### Phase 4: Performance

- [ ] Image optimization
- [ ] Code splitting
- [ ] Service Worker
- [ ] CDN

---

## 🔗 Integración Backend

### Esperado

```javascript
// Llamada a la API Node.js
const response = await fetch('/api/weather?lat=40.4168&lon=-3.7038');
const data = await response.json();

// Respuesta
{
  success: true,
  data: {
    current: { temperature, windSpeed, humidity, ... },
    forecast: Array<Day>,
    hourly: Array<Hour>
  },
  summary: "Temperatura actual: 12.5°C, Viento: 18.3 km/h..."
}
```

### Implementación

```astro
---
// src/pages/api/weather.js (SSR Astro)
export const POST = async ({ request }) => {
  const { latitude, longitude } = await request.json();
  
  // Llamar a weatherService
  const result = await weatherService.getWeather({ latitude, longitude });
  
  return new Response(JSON.stringify(result));
};
---
```

---

## 📖 Referencia de Componentes

| Componente | Archivo | Responsabilidad |
|-----------|---------|-----------------|
| Header | Header.astro | Navegación + theme toggle |
| CurrentWeather | CurrentWeather.astro | Clima actual prominente |
| ForecastCard | ForecastCard.astro | Pronóstico diario |
| AlertBanner | AlertBanner.astro | Alertas meteorológicas |
| LocationSearch | LocationSearch.astro | Búsqueda de ubicaciones |
| Layout | Layout.astro | Estructura base |
| HomePage | index.astro | Página principal |

---

## 🎓 Principios Aplicados

1. **HTML-First** → Astro renderiza estático
2. **CSS-in-JS Mínimo** → Solo donde necesario
3. **Zero JS Unless Needed** → JavaScript vanilla encapsulado
4. **Mobile-First** → Media queries progresivas
5. **Accesibilidad Real** → WCAG 2.2 compliance
6. **Performance** → Assets optimizados
7. **Mantenibilidad** → Código claro y comentado
8. **Escalabilidad** → Componentes reutilizables

---

Versión: 1.0.0-beta  
Última actualización: Diciembre 2025  
Estado: ✅ Listo para Desarrollo
