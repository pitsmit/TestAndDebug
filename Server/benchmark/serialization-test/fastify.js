const autocannon = require('autocannon');

async function runTest() {
    const result = await autocannon({
        url: 'http://localhost:3000/api/v1/feed?page=1&limit=5',
        connections: 10,
        duration: 10,
        timeout: 20
    });

    console.log(`✅ Fastify: ${result.requests.average} req/sec`);
    return result.requests.average;
}

runTest().catch(console.error);