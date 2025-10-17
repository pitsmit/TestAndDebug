const path = require('path');
const moduleAlias = require('module-alias');

// Регистрируем алиасы аналогично вашему tsconfig
moduleAlias.addAliases({
    '@': path.join(__dirname, '..'),
    '@Facade': path.join(__dirname, '..', 'Facade'),
    '@IRepository': path.join(__dirname, '..', 'Repository', 'Interfaces'),
    '@Repository': path.join(__dirname, '..', 'Repository', 'Implementations'),
    '@Services': path.join(__dirname, '..', 'Core', 'Services'),
    '@Essences': path.join(__dirname, '..', 'Core', 'Essences'),
    '@Core': path.join(__dirname, '..', 'Core'),
    '@UI': path.join(__dirname, '..', 'UI'),
    '@UICommands': path.join(__dirname, '..', 'UI', 'Commands'),
    '@TechUI': path.join(__dirname, '..', 'UI', 'TechUI'),
    '@shared': path.join(__dirname, '..', '..', 'shared')
});

console.log('Aliases registered successfully');