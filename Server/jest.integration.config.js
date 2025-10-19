/** @type {import('jest').Config} */
const config = {
    preset: "ts-jest",
    randomize: false,
    showSeed: false,
    testEnvironment: "allure-jest/node",
    moduleNameMapper: {
        '^@Facade/(.*)$': '<rootDir>/src/Facade/$1',
        '^@Commands/(.*)$': '<rootDir>/src/Commands/$1',
        '^@Core/(.*)$': '<rootDir>/src/Core/$1',
        '^@Services/(.*)$': '<rootDir>/src/Core/Services/$1',
        '^@Essences/(.*)$': '<rootDir>/src/Core/Essences/$1',
        '^@Repository/(.*)$': '<rootDir>/src/Repository/Implementations/$1',
        '^@IRepository/(.*)$': '<rootDir>/src/Repository/Interfaces/$1',
        '^@shared/(.*)$': '<rootDir>/src/shared/$1',
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/integration-tests/**/*.test.ts'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    setupFiles: ['<rootDir>/jest.polyfills.js']
};

module.exports = config;