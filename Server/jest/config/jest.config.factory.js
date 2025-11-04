const path = require('path');

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
        timeout = 30000,
        setupFiles = [],
        rootDir = process.cwd()
    } = options;

    const resolvePath = (relativePath) => path.resolve(rootDir, relativePath);

    const baseConfig = {
        preset: "ts-jest",
        testEnvironment: "allure-jest/node",
        rootDir: rootDir,
        roots: [resolvePath('src')],
        setupFilesAfterEnv: [resolvePath('jest/setup/jest.setup.ts')],
        moduleNameMapper: {
            '^@Facade/(.*)$': resolvePath('src/Facade/$1'),
            '^@Commands/(.*)$': resolvePath('src/Commands/$1'),
            '^@Core/(.*)$': resolvePath('src/Core/$1'),
            '^@Services/(.*)$': resolvePath('src/Core/Services/$1'),
            '^@Essences/(.*)$': resolvePath('src/Core/Essences/$1'),
            '^@Repository/(.*)$': resolvePath('src/Repository/Implementations/$1'),
            '^@IRepository/(.*)$': resolvePath('src/Repository/Interfaces/$1'),
            '^@shared/(.*)$': resolvePath('src/shared/$1'),
            '^@/(.*)$': resolvePath('src/$1'),
            '^@Helpers/(.*)$': resolvePath('src/__tests__/helpers/$1'),
            '^@Mocks/(.*)$': resolvePath('src/__tests__/mocks/$1'),
        },
        randomize,
        showSeed,
        testTimeout: timeout,
        setupFiles: setupFiles.map(file => resolvePath(file)),
    };

    const testConfigs = {
        unit: {
            testMatch: ['**/__tests__/unit-tests/*.test.ts'],
        },
        integration: {
            testMatch: ['**/__tests__/integration-tests/**/*.test.ts'],
            setupFiles: ['<rootDir>/jest/setup/jest.polyfills.js'], // Обновленный путь
        },
        e2e: {
            testMatch: ['**/__tests__/e2e-tests/**/*.test.ts'],
            setupFiles: ['<rootDir>/jest/setup/jest.polyfills.js'], // Обновленный путь
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