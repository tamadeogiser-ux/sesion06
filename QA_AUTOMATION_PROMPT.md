# Prompt para Automatización de QA en Git

## Contexto

Deseo asegurar la calidad del código en mi proyecto Full Stack (Node.js + Astro) impidiendo que se suba código roto al repositorio.

## Objetivo

Configurar un sistema de **Git Hooks** que ejecute las pruebas automáticas antes de realizar un commit o un push.

## Requerimientos Técnicos

1. **Herramienta**: Usar `husky` para gestionar los hooks de Git de forma sencilla.
2. **Hook**: Configurar un hook `pre-push` (o `pre-commit` si se prefiere validación local inmediata).
3. **Flujo de Trabajo**:
   - Al intentar hacer `git push`.
   - Ejecutar todos los tests (backend y frontend).
   - Si los tests pasan (Exit Code 0) -> Permitir el push.
   - Si los tests fallan (Exit Code != 0) -> Bloquear el push y mostrar el error.

## Instrucciones para la IA

"Actúa como un ingeniero DevOps experto. Configura Husky en este proyecto para ejecutar `npm test` antes de cada push.

Pasos a realizar:

1. Instala `husky` como dependencia de desarrollo: `npm install husky --save-dev`
2. Inicializa husky: `npx husky init`
3. Crea/Edita el hook `.husky/pre-push` con el siguiente contenido:

   ```bash
   echo "📢 Ejecutando pruebas automáticas antes de subir..."
   npm run test
   ```

4. Asegúrate de que el script `test` en `package.json` ejecute tanto los tests de backend como los de frontend (si están separados, usa algo como `npm-run-all` o encadena los comandos).
"
