/**
 * @param {{
 *   testType?: 'unit' | 'integration' | 'e2e';
 *   randomize?: boolean;
 *   showSeed?: boolean;
 *   timeout?: number;
 *   setupFiles?: string[];
 * }} options
 */
const createJestConfig = (options = {}) => {
    const {
        testType = 'unit',
        randomize = true,
        showSeed = true,
        timeout = 5000,
        setupFiles = []
    } = options;

    const baseConfig = {
        preset: "ts-jest",
        testEnvironment: "allure-jest/node",
        roots: ['<rootDir>/src'],
        setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
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
            '^@Helpers/(.*)$': '<rootDir>/src/__tests__/helpers/$1',
            '^@Mocks/(.*)$': '<rootDir>/src/__tests__/mocks/$1',
        },
        randomize,
        showSeed,
        testTimeout: timeout,
        setupFiles: [...setupFiles],
    };

    const testConfigs = {
        unit: {
            testMatch: ['**/__tests__/unit-tests/*.test.ts'],
        },
        integration: {
            testMatch: ['**/__tests__/integration-tests/**/*.test.ts'],
            setupFiles: ['<rootDir>/jest.polyfills.js'],
        },
        e2e: {
            testMatch: ['**/__tests__/e2e-tests/**/*.test.ts'],
            setupFiles: ['<rootDir>/jest.polyfills.js'],
            verbose: true,
            collectCoverageFrom: [
                'src/**/*.ts',
                '!src/index.ts',
                '!src/**/*.d.ts'
            ],
        }
    };

    return {
        ...baseConfig,
        ...testConfigs[testType],
    };
};

const unitConfig = createJestConfig({ testType: 'unit' });
const integrationConfig = createJestConfig({
    testType: 'integration',
    randomize: false,
    showSeed: false
});
const e2eConfig = createJestConfig({
    testType: 'e2e',
    timeout: 30000
});

module.exports = {
    createJestConfig,
    unitConfig,
    integrationConfig,
    e2eConfig
};