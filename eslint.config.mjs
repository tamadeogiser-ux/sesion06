// eslint.config.mjs
import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
    { files: ["**/*.js", "**/*.mjs"] },
    { languageOptions: { globals: { ...globals.browser, ...globals.node, ...globals.jest } } },
    pluginJs.configs.recommended,
    {
        rules: {
            "no-unused-vars": "warn", // Solo avisar si la IA crea variables que no usa
            "no-undef": "error", // Fallar si la IA usa variables que no existen (alucinacion)
            "no-console": "warn" // Evitar dejar console.log perdidos
        }
    }
];