module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: [
        '**/__tests__/**/*.test.ts',
        '**/__tests__/integration/**/*.test.ts'
    ],
    moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@Facade/(.*)$': '<rootDir>/src/Facade/$1',
        '^@UICommands/(.*)$': '<rootDir>/src/UI/Commands/$1',
        '^@Essences/(.*)$': '<rootDir>/src/Core/Essences/$1',
        '^@Repository/(.*)$': '<rootDir>/src/Repository/Implementations/$1',
        '^@IRepository/(.*)$': '<rootDir>/src/Repository/Interfaces/$1',
        '^@Core/(.*)$': '<rootDir>/src/Core/$1',
        '^@shared/(.*)$': '<rootDir>/../shared/$1',
    },
    setupFiles: ['<rootDir>/../.env.test']
};