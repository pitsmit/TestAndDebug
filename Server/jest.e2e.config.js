module.exports = {
    preset: 'ts-jest',
    testEnvironment: "allure-jest/node",
    testMatch: ['**/__tests__/e2e-tests/**/*.test.ts'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    setupFiles: ['<rootDir>/jest.polyfills.js'],
    roots: ['<rootDir>/src'],
    testTimeout: 30000,
    verbose: true,
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/index.ts',
        '!src/**/*.d.ts'
    ],
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
};