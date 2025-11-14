const autocannon = require('autocannon');
const fs = require('fs');

async function runExpressTest(runNumber, duration = 30, connections = 10) {
    const url = 'http://framework-express:3000/api/health';
    console.log(`🧪 Testing EXPRESS (run ${runNumber})...`);

    const result = await autocannon({
        url: url,
        connections: connections,
        duration: duration,
        title: `express-health-test-run-${runNumber}`
    });

    const testResult = {
        framework: 'express',
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

    console.log(`✅ EXPRESS run ${runNumber}: ${result.requests.average} req/sec`);
    return testResult;
}

async function main() {
    const results = [];
    const runs = 3;

    console.log(`🚀 Starting EXPRESS-only benchmark with ${runs} runs`);

    for (let i = 1; i <= runs; i++) {
        console.log(`\n📊 Run ${i}/${runs}`);
        const result = await runExpressTest(i, 10, 5);
        results.push(result);

        // Пауза между тестами
        if (i < runs) {
            console.log('⏳ Waiting 3 seconds before next run...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    // Сохраняем результаты
    fs.mkdirSync('/app/results', { recursive: true });
    fs.writeFileSync('/app/results/express-benchmark.json', JSON.stringify(results, null, 2));

    // Отчет
    generateReport(results, 'EXPRESS');
}

function generateReport(results, framework) {
    console.log(`\n📈 ${framework} BENCHMARK REPORT`);
    console.log('='.repeat(50));

    const avgRPS = results.reduce((sum, r) => sum + r.requests.average, 0) / results.length;
    const avgLatency = results.reduce((sum, r) => sum + r.latency.p99, 0) / results.length;

    console.log(`Average Requests/sec: ${avgRPS.toFixed(0)}`);
    console.log(`Average P99 Latency:  ${avgLatency.toFixed(2)}ms`);

    results.forEach(run => {
        console.log(`  Run ${run.run}: ${run.requests.average.toFixed(0)} req/sec, P99: ${run.latency.p99.toFixed(2)}ms`);
    });
}

main().catch(console.error);