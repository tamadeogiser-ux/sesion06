import eslintPluginAstro from 'eslint-plugin-astro';
import tsParser from '@typescript-eslint/parser';

export default [
    ...eslintPluginAstro.configs.recommended,
    {
        files: ["**/*.astro"],
        languageOptions: {
            parser: eslintPluginAstro.parser,
            parserOptions: {
                parser: tsParser,
                extraFileExtensions: [".astro"],
            }
        },
        rules: {
            "no-unused-vars": "off", // Dejar que TS maneje esto
            "astro/no-set-html-directive": "warn",
        }
    }
];
