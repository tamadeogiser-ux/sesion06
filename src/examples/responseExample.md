# Ejemplo de Respuesta Procesada

## Consulta

```javascript
const location = {
  latitude: 40.4168,  // Madrid
  longitude: -3.7038
};

const result = await weatherService.getWeather(location);
```

## Respuesta Exitosa

```javascript
{
  success: true,
  data: {
    current: {
      timestamp: "2025-12-21T14:30",
      temperature: 12.5,
      windSpeed: 18.3,
      windDirection: 245,
      weatherCode: 1,
      timezone: "Europe/Madrid"
    },
    forecast: [
      {
        date: "2025-12-21",
        tempMax: 15.2,
        tempMin: 8.1,
        precipitation: 0.5,
        weatherCode: 61
      },
      {
        date: "2025-12-22",
        tempMax: 14.8,
        tempMin: 7.5,
        precipitation: 2.3,
        weatherCode: 63
      },
      {
        date: "2025-12-23",
        tempMax: 16.1,
        tempMin: 9.0,
        precipitation: 0.0,
        weatherCode: 0
      }
    ],
    hourly: [
      {
        timestamp: "2025-12-21T14:00",
        precipitation: 0.1,
        windSpeed: 17.5,
        humidity: 65
      },
      {
        timestamp: "2025-12-21T15:00",
        precipitation: 0.0,
        windSpeed: 18.3,
        humidity: 62
      },
      {
        timestamp: "2025-12-21T16:00",
        precipitation: 0.2,
        windSpeed: 19.1,
        humidity: 68
      }
    ]
  },
  summary: "Temperatura actual: 12.5°C, Viento: 18.3 km/h. Mañana: máx 15.2°C, mín 8.1°C. Precipitación esperada: 0.5 mm."
}
```

## Respuesta con Error

```javascript
{
  success: false,
  error: "API Error: 503 Service Unavailable",
  data: null
}
```

## Alertas Activas

```javascript
const alerts = weatherService.checkWeatherAlerts(result.data, {
  maxWind: 30,
  minTemperature: 0,
  maxTemperature: 35,
  minPrecipitation: 5
});

// Respuesta
[
  {
    type: 'HIGH_WIND',
    severity: 'warning',
    message: 'Viento fuerte: 18.3 km/h (umbral: 30)',
    value: 18.3
  }
]
```

## Códigos Meteorológicos (WMO)

Los datos incluyen `weatherCode` según el estándar WMO:

- 0: Cielo despejado
- 1, 2, 3: Principalmente despejado
- 45, 48: Niebla
- 51-67: Lluvia/Llovizna
- 80-82: Lluvia fuerte
- 85, 86: Nieve de aguanieve
- 95-99: Tormenta

Ver: [WMO Weather Codes](https://www.wmo.int/en)
