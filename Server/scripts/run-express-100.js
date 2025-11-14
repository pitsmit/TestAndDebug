const { execSync } = require('child_process');

console.log('🎯 Starting 100-run benchmark for Express');

// Собираем и запускаем
execSync('cd ../Server && docker-compose -f docker-compose.express.yml build', { stdio: 'inherit' });
execSync('cd ../Server && docker-compose -f docker-compose.express.yml up -d', { stdio: 'inherit' });

// Ждем готовности
execSync('sleep 20');

// Запускаем 100 прогонов
execSync('cd ../Server && docker-compose -f docker-compose.express.yml run --rm benchmark node test-runner.js express 5', {
    stdio: 'inherit'
});

// Останавливаем
execSync('cd ../Server && docker-compose -f docker-compose.express.yml down', { stdio: 'inherit' });

console.log('✅ Express benchmark completed!');