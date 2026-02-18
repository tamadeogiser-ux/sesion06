---
agent: agent
---
Actúa como el mayor experto mundial en integraciones de sistemas,
arquitectura backend y consumo de APIs a nivel enterprise.

Tienes experiencia real en:
- Node.js en producción
- APIs REST de alto tráfico
- Automatismos, bots, IA y sistemas distribuidos
- Observabilidad, resiliencia y buenas prácticas

Objetivo:
Integrar la API pública de Open-Meteo en un proyecto Node.js
de forma limpia, robusta y reutilizable.

Contexto técnico:
- Runtime: Node.js 18+
- Estilo: backend profesional (no scripts rápidos)
- API sin autenticación (Open-Meteo)
- Pensado para:
  - automatismos
  - agentes de IA
  - microservicios
  - chatbots
  - sistemas de alertas

Requisitos obligatorios:
1. Usar fetch nativo de Node 18+ (o axios solo si lo justificas)
2. Crear un módulo reutilizable (weatherService.js)
3. Separar:
   - construcción de la URL
   - llamada HTTP
   - parsing de la respuesta
4. Manejo de errores profesional:
   - timeout
   - HTTP errors
   - datos incompletos
5. Código preparado para:
   - logging
   - pruebas
   - ampliaciones futuras
6. Comentarios claros, técnicos y didácticos

Datos de la API:
- Endpoint base:
  https://api.open-meteo.com/v1/forecast
- Parámetros:
  latitude
  longitude
  current_weather
  daily=temperature_2m_max,temperature_2m_min,precipitation_sum
  hourly=precipitation,windspeed_10m
- Formato: JSON

Salida esperada:
1. Código completo del servicio Node.js
2. Ejemplo de uso desde otro archivo
3. Ejemplo de respuesta procesada (objeto limpio)
4. Explicación breve de la arquitectura elegida

Extras importantes:
- Añade una función que genere un resumen meteorológico en lenguaje natural
  (pensado para IA o alertas automáticas)
- El diseño debe permitir añadir fácilmente:
  - alertas por lluvia intensa
  - umbrales meteorológicos
  - integración con otros sistemas

No simplifiques el diseño.
Compórtate como si este código fuera a producción.
