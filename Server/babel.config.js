module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    node: '18'
                }
            }
        ],
        '@babel/preset-typescript'
    ],
    plugins: [
        // 💡 ВАЖНО: Сначала декораторы, потом class properties
        ["@babel/plugin-proposal-decorators", { "legacy": true }],
        ["@babel/plugin-proposal-class-properties", { "loose": true }],

        // Metadata plugin должен быть после декораторов
        "babel-plugin-transform-typescript-metadata",

        [
            'module-resolver',
            {
                root: ['./src'],
                alias: {
                    '@': './src',
                    '@Facade': './src/Facade',
                    '@IRepository': './src/Repository/Interfaces',
                    '@Repository': './src/Repository/Implementations',
                    '@Services': './src/Core/Services',
                    '@Essences': './src/Core/Essences',
                    '@Core': './src/Core',
                    '@UI': './src/UI',
                    '@UICommands': './src/UI/Commands',
                    '@TechUI': './src/UI/TechUI',
                    '@shared': './src/shared'
                }
            }
        ]
    ]
};