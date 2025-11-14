const { execSync } = require('child_process');

console.log('🎯 Starting 100-run benchmark for Fastify');

// Собираем и запускаем
execSync('cd ../Server && docker-compose -f docker-compose.fastify.yml build', { stdio: 'inherit' });
execSync('cd ../Server && docker-compose -f docker-compose.fastify.yml up -d', { stdio: 'inherit' });

// Ждем готовности
execSync('sleep 20');

// Запускаем 100 прогонов
execSync('cd ../Server && docker-compose -f docker-compose.fastify.yml run --rm benchmark node test-runner.js fastify 100', {
    stdio: 'inherit'
});

// Останавливаем
execSync('cd ../Server && docker-compose -f docker-compose.fastify.yml down', { stdio: 'inherit' });

console.log('✅ Fastify benchmark completed!');