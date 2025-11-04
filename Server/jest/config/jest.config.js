const { createJestConfig } = require('./jest.config.factory');

const config = {
    projects: [
        {
            ...createJestConfig({ testType: 'unit' }),
            displayName: 'unit',
        },
        {
            ...createJestConfig({
                testType: 'integration',
                randomize: false,
                showSeed: false
            }),
            displayName: 'integration',
        },
        {
            ...createJestConfig({
                testType: 'e2e',
                timeout: 30000
            }),
            displayName: 'e2e',
        }
    ]
};

module.exports = config;