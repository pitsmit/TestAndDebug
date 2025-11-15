const autocannon = require('autocannon');

async function runTest() {
    const result = await autocannon({
        url: 'http://localhost:3000/api/v1/feed?page=1&limit=5',
        connections: 10,
        duration: 5,
        timeout: 5,
        pipelining: 1,
        latency: true,
        renderStatusCodes: true,
        json: true,
        idReplacement: true
    });

    const detailedResult = {
        requests: result.requests,
        latency: result.latency,
        throughput: result.throughput,
        errors: result.errors,
        timeouts: result.timeouts,
        duration: result.duration,
        start: result.start,
        finish: result.finish
    };

    return detailedResult;
}

runTest().catch(console.error);