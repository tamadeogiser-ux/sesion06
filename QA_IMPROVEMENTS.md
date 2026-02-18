# Plan de Mejoras de QA para Mitigar Errores de IA (Vibe Coding)

Este documento detalla las estrategias para blindar el repositorio contra errores comunes introducidos por asistentes de IA y desarrollo rápido.

## 1. Análisis Estático (ESLint) 🛡️ **[IMPLEMENTADO]**

**Objetivo:** Detectar errores de síntaxis, variables no usadas y malas prácticas antes de ejecutar código.
**Por qué es vital para IA:** Las IAs a menudo alucinan variables no declaradas o dejan "código muerto" (imports no usados, variables asigandas pero no leídas).

- [x] Configuración en Backend (Node.js)
- [x] Configuración en Frontend (Astro)
- [x] Integración en CI/CD local (Husky)

## 2. Formateo Automático (Prettier) 🎨 **[PENDIENTE]**

**Objetivo:** Mantener un estilo de código consistente sin importar qué modelo de IA generó el código.
**Estrategia:**

- Instalar `prettier`.
- Configurar `.prettierrc`.
- Usar `lint-staged` para formatear solo los archivos modificados al hacer commit.

## 3. Comprobación de Tipos (Type Checking) 🔍 **[PENDIENTE]**

**Objetivo:** Validar que los objetos y funciones existen y se usan con los argumentos correctos.
**Estrategia:**

- En el Frontend (Astro): Ejecutar `astro check`.
- En el Backend (JS/JSDoc): Configurar TS en modo `allowJs` o usar `jsdoc` estricto.

## 4. Auditoría de Seguridad (npm audit) 🔐 **[PENDIENTE]**

**Objetivo:** Evitar que la IA sugiera paquetes obsoletos o vulnerables.
**Estrategia:**

- Añadir `npm audit --audit-level=high` al pipeline de pre-push.

## 5. Pruebas de Snapshot (Visual Regression) 📸 **[PENDIENTE]**

**Objetivo:** Detectar si la IA "rompió" el diseño visual sin querer.
**Estrategia:**

- Usar Vitest/Jest snapshots para componentes UI.
- Si el HTML generado cambia inesperadamente, el test falla.

## 6. Límite de Cobertura (Coverage Thresholds) 📊 **[PENDIENTE]**

**Objetivo:** Obligar a la IA a escribir tests para el código nuevo.
**Estrategia:**

- Configurar Jest/Vitest con `coverageThreshold`.
- Si el % de cobertura baja del 80%, impedir el push.
