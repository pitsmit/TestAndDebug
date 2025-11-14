const autocannon = require('autocannon');
const fs = require('fs');
const { execSync } = require('child_process');

const frameworks = [
    { name: 'express', port: 3000, service: 'framework-express' },
    { name: 'fastify', port: 3001, service: 'framework-fastify' }
];

async function runTest(framework, runNumber, duration = 30, connections = 10) {
    const url = `http://localhost:${framework.port}/api/health`;
    console.log(`🧪 Testing ${framework.name} (run ${runNumber})...`);

    const result = await autocannon({
        url: url,
        connections: connections,
        duration: duration,
        title: `${framework.name}-health-test-run-${runNumber}`
    });

    const testResult = {
        framework: framework.name,
        run: runNumber,
        timestamp: new Date().toISOString(),
        duration: duration,
        connections: connections,
        requests: {
            total: result.requests.total,
            average: result.requests.average,
            sent: result.requests.sent
        },
        latency: {
            average: result.latency.average,
            min: result.latency.min,
            max: result.latency.max,
            p50: result.latency.p50,
            p75: result.latency.p75,
            p90: result.latency.p90,
            p99: result.latency.p99
        },
        throughput: result.throughput,
        errors: result.errors
    };

    console.log(`✅ ${framework.name} run ${runNumber}: ${result.requests.average} req/sec`);
    return testResult;
}

function restartContainer(serviceName) {
    console.log(`🔄 Restarting ${serviceName}...`);
    try {
        execSync(`cd ../Server && docker compose restart ${serviceName}`, { stdio: 'inherit' });
        // Ждем пока контейнер перезапустится
        execSync('sleep 10');
        // Ждем пока health endpoint станет доступен
        execSync(`timeout 30 bash -c 'until curl -f http://localhost:${serviceName === 'framework-express' ? 3000 : 3001}/api/health; do sleep 2; done'`);
        console.log(`✅ ${serviceName} restarted and ready`);
    } catch (error) {
        console.error(`❌ Failed to restart ${serviceName}:`, error.message);
        throw error;
    }
}

async function main() {
    const allResults = [];
    const runs = 3; // 3 прогона на каждый фреймворк

    console.log(`🚀 Starting sequential benchmark with ${runs} runs per framework`);

    for (const framework of frameworks) {
        console.log(`\n🎯 Testing ${framework.name.toUpperCase()}`);
        console.log('='.repeat(40));

        for (let i = 1; i <= runs; i++) {
            console.log(`\n📊 Run ${i}/${runs} for ${framework.name}`);

            // Перезапускаем контейнер перед каждым тестом
            if (i > 1) {
                restartContainer(framework.service);
            }

            const result = await runTest(framework, i, 10, 5);
            allResults.push(result);

            // Пауза между тестами
            if (i < runs) {
                console.log('⏳ Waiting 5 seconds before next run...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }

    // Сохраняем результаты
    fs.mkdirSync('/app/results', { recursive: true });
    fs.writeFileSync('/app/results/sequential-benchmark.json', JSON.stringify(allResults, null, 2));

    // Генерируем отчет
    generateReport(allResults);
}

function generateReport(results) {
    console.log('\n📈 FINAL SEQUENTIAL BENCHMARK REPORT');
    console.log('='.repeat(60));

    frameworks.forEach(framework => {
        const frameworkResults = results.filter(r => r.framework === framework.name);
        const avgRPS = frameworkResults.reduce((sum, r) => sum + r.requests.average, 0) / frameworkResults.length;
        const avgLatency = frameworkResults.reduce((sum, r) => sum + r.latency.p99, 0) / frameworkResults.length;

        console.log(`\n${framework.name.toUpperCase()} (${frameworkResults.length} runs):`);
        console.log(`  Average Requests/sec: ${avgRPS.toFixed(0)}`);
        console.log(`  Average P99 Latency:  ${avgLatency.toFixed(2)}ms`);

        // Детали по каждому прогону
        frameworkResults.forEach(run => {
            console.log(`    Run ${run.run}: ${run.requests.average.toFixed(0)} req/sec, P99: ${run.latency.p99.toFixed(2)}ms`);
        });
    });

    // Сравнение
    console.log('\n🏆 COMPARISON:');
    const expressResults = results.filter(r => r.framework === 'express');
    const fastifyResults = results.filter(r => r.framework === 'fastify');

    if (expressResults.length > 0 && fastifyResults.length > 0) {
        const expressAvg = expressResults.reduce((sum, r) => sum + r.requests.average, 0) / expressResults.length;
        const fastifyAvg = fastifyResults.reduce((sum, r) => sum + r.requests.average, 0) / fastifyResults.length;

        console.log(`Express: ${expressAvg.toFixed(0)} req/sec`);
        console.log(`Fastify: ${fastifyAvg.toFixed(0)} req/sec`);
        console.log(`Difference: ${(fastifyAvg - expressAvg).toFixed(0)} req/sec (${((fastifyAvg - expressAvg) / expressAvg * 100).toFixed(1)}%)`);
    }
}

main().catch(console.error);