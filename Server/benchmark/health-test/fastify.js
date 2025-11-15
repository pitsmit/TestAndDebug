const autocannon = require('autocannon');

async function runTest() {
    const result = await autocannon({
        url: 'http://app:3000/api/health',
        connections: 10,
        duration: 10,
        timeout: 20
    });

    console.log(`✅ Fastify: ${result.requests.average} req/sec`);
    return result.requests.average;
}

runTest().catch(console.error);