/** @type {import('jest').Config} */
const config = {
    preset: "ts-jest",
    randomize: true,
    showSeed: true,
    testEnvironment: "allure-jest/node",
    moduleNameMapper: {
        '^@Facade/(.*)$': '<rootDir>/src/Facade/$1',
        '^@UICommands/(.*)$': '<rootDir>/src/UI/Commands/$1',
        '^@Core/(.*)$': '<rootDir>/src/Core/$1',
        '^@Services/(.*)$': '<rootDir>/src/Core/Services/$1',
        '^@Essences/(.*)$': '<rootDir>/src/Core/Essences/$1',
        '^@Repository/(.*)$': '<rootDir>/src/Repository/Implementations/$1',
        '^@IRepository/(.*)$': '<rootDir>/src/Repository/Interfaces/$1',
        '^@shared/(.*)$': '<rootDir>/../shared/$1',
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.test.ts'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts']
};

export default config;