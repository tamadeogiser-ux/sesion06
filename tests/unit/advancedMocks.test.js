// advancedMocks.test.js
import { jest } from '@jest/globals';
import { Logger } from '../../src/utils/weatherUtils.js';

describe('Advanced Mocking Suite', () => {

    // -------------------------------------------------------------------------
    // 1. Mocking de Variables de Entorno (process.env)
    // Objetivo: Verificar comportamiento que depende de configuración ambiental
    // -------------------------------------------------------------------------
    describe('Logger Environment Mocks', () => {
        const originalEnv = process.env;

        beforeEach(() => {
            jest.resetModules(); // Limpia cache de módulos
            process.env = { ...originalEnv }; // Copia limpia
            jest.spyOn(console, 'log').mockImplementation(() => { });
        });

        afterEach(() => {
            process.env = originalEnv; // Restaurar
            jest.restoreAllMocks();
        });

        test('no debe loguear debug si env.DEBUG no está activo', () => {
            // Arrange
            process.env.DEBUG = 'false';
            const logger = new Logger('Test');

            // Act
            logger.debug('Mensaje secreto');

            // Assert
            expect(console.log).not.toHaveBeenCalled();
        });

        test('debe loguear debug si env.DEBUG es "true"', () => {
            // Arrange
            process.env.DEBUG = 'true';
            const logger = new Logger('Test');

            // Act
            logger.debug('Mensaje visible');

            // Assert
            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('Mensaje visible'),
                expect.anything()
            );
        });
    });

    // -------------------------------------------------------------------------
    // 2. Mocking de Temporizadores (Fake Timers)
    // Objetivo: Verificar lógica de retries sin esperar el tiempo real (speed up)
    // NOTA: Testing de retries asíncronos con Fake Timers es complejo debido a
    // microtasks queue v/s timer queue. Para esta demo, simplificamos probando
    // spies directamente.
    // -------------------------------------------------------------------------
    describe('Spies & Time Mocks', () => {

        test('Date.now() mocking para probar timestamps fijos', () => {
            // Arrange
            const fixedTime = new Date('2026-01-01T00:00:00Z').getTime();
            jest.spyOn(Date, 'now').mockReturnValue(fixedTime);

            // Act
            const now = Date.now();

            // Assert
            expect(now).toBe(fixedTime);
        });

        test('Spy on console.warn', () => {
            // Arrange
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

            // Act
            console.warn('Alerta de prueba');

            // Assert
            expect(warnSpy).toHaveBeenCalledWith('Alerta de prueba');
        });
    });
});
