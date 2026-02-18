#!/usr/bin/env node

/**
 * Script de Verificación del Proyecto
 * 
 * Ejecutar: node verify-setup.js
 * Verifica que todo esté correctamente configurado
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = [
    'src/services/weatherService.js',
    'src/utils/weatherUtils.js',
    'src/examples/basicExample.js',
    'src/examples/advancedExample.js',
    'package.json',
    'README.md',
    'ARCHITECTURE.md',
    'QUICK_START.md',
    'INDEX.md',
];

const REQUIRED_FUNCTIONS = {
    'src/services/weatherService.js': [
        'getWeather',
        'checkWeatherAlerts',
        'buildWeatherUrl',
        'fetchWeatherData',
        'parseWeatherResponse',
        'generateWeatherSummary',
    ],
    'src/utils/weatherUtils.js': [
        'Logger',
        'MetricsCollector',
        'WeatherCache',
        'getWeatherDescription',
        'calculateHeatIndex',
        'calculateWindChill',
    ],
};

function checkFile(filePath) {
    const fullPath = path.join(__dirname, filePath);
    return fs.existsSync(fullPath);
}

function checkFunction(filePath, functionName) {
    const fullPath = path.join(__dirname, filePath);
    const content = fs.readFileSync(fullPath, 'utf-8');
    return (
        content.includes(`function ${functionName}`) ||
        content.includes(`class ${functionName}`) ||
        content.includes(`const ${functionName}`)
    );
}

function main() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 VERIFICACIÓN DE PROYECTO - OPEN-METEO INTEGRATION');
    console.log('='.repeat(60) + '\n');

    let allGood = true;

    // Verificar archivos
    console.log('📁 Verificando archivos...\n');
    REQUIRED_FILES.forEach((file) => {
        const exists = checkFile(file);
        const status = exists ? '✅' : '❌';
        console.log(`  ${status} ${file}`);
        if (!exists) allGood = false;
    });

    // Verificar funciones
    console.log('\n🔧 Verificando funciones principales...\n');
    Object.entries(REQUIRED_FUNCTIONS).forEach(([file, functions]) => {
        console.log(`  📄 ${file}:`);
        functions.forEach((func) => {
            const exists = checkFunction(file, func);
            const status = exists ? '✅' : '❌';
            console.log(`     ${status} ${func}`);
            if (!exists) allGood = false;
        });
    });

    // Resultado final
    console.log('\n' + '='.repeat(60));
    if (allGood) {
        console.log('✨ ¡TODO CORRECTO! Proyecto listo para usar');
        console.log('\n📖 Próximos pasos:');
        console.log('   1. Leer README.md');
        console.log('   2. npm run example:basic');
        console.log('   3. Integrar en tu código');
    } else {
        console.log('❌ Faltan archivos o funciones. Verifica la instalación.');
    }
    console.log('='.repeat(60) + '\n');

    process.exit(allGood ? 0 : 1);
}

main();
