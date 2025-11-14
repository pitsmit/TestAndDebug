const autocannon = require('autocannon');
const fs = require('fs');

const targets = [
    { name: 'express', url: 'http://express-app:3000/api/health' },
    { name: 'fastify', url: 'http://fastify-app:3000/api/health' }
];

async function runTest(target, duration = 30, connections = 10) {
    console.log(`🧪 Testing ${target.name}...`);

    const result = await autocannon({
        url: target.url,
        connections: connections,
        duration: duration,
        title: `${target.name}-health-test`
    });

    const testResult = {
        framework: target.name,
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

    console.log(`✅ ${target.name}: ${result.requests.average} req/sec`);
    return testResult;
}

async function main() {
    const allResults = [];
    const runs = parseInt(process.env.RUNS || 5); // Можно настроить через env

    console.log(`🚀 Starting benchmark with ${runs} runs per framework`);

    for (let i = 0; i < runs; i++) {
        console.log(`\n📊 Run ${i + 1}/${runs}`);

        for (const target of targets) {
            const result = await runTest(target, 10, 5);
            allResults.push(result);

            // Пауза между тестами
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    // Сохраняем результаты
    fs.mkdirSync('/app/results', { recursive: true });
    fs.writeFileSync('/app/results/benchmark.json', JSON.stringify(allResults, null, 2));

    // Генерируем отчет
    generateReport(allResults);
}

function generateReport(results) {
    console.log('\n📈 FINAL REPORT');
    console.log('='.repeat(50));

    targets.forEach(target => {
        const targetResults = results.filter(r => r.framework === target.name);
        const avgRPS = targetResults.reduce((sum, r) => sum + r.requests.average, 0) / targetResults.length;
        const avgLatency = targetResults.reduce((sum, r) => sum + r.latency.p99, 0) / targetResults.length;

        console.log(`\n${target.name.toUpperCase()}:`);
        console.log(`  Requests/sec: ${avgRPS.toFixed(0)}`);
        console.log(`  P99 Latency:  ${avgLatency.toFixed(2)}ms`);
        console.log(`  Total runs:   ${targetResults.length}`);
    });
}

main().catch(console.error);