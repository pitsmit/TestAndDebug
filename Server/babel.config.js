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
        ["@babel/plugin-proposal-decorators", { "legacy": true }],
        ["@babel/plugin-proposal-class-properties", { "loose": true }],
        ["@babel/plugin-transform-private-methods", { "loose": true }],
        ["@babel/plugin-transform-private-property-in-object", { "loose": true }],

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
                    '@Commands': './src/Commands',
                    '@TechUI': './src/TechUI',
                    '@shared': './src/shared'
                }
            }
        ]
    ]
};