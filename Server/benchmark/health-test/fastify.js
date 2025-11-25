const autocannon = require('autocannon');

async function runTest() {
    const result = await autocannon({
        url: 'http://app:3000/api/health',
        connections: 100,
        duration: 10,
        timeout: 3,
        pipelining: 1,
        latency: true,
        renderStatusCodes: true,
        json: true,
        idReplacement: true
    });

    return {
        requests: result.requests,
        latency: result.latency,
        throughput: result.throughput,
        errors: result.errors,
        timeouts: result.timeouts,
        duration: result.duration,
        start: result.start,
        finish: result.finish
    };
}

runTest().catch(console.error);