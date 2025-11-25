const autocannon = require('autocannon');

async function runTest() {
    const loginData = {
        login: "user1",
        password: "userass1"
    };

    const result = await autocannon({
        url: 'http://app:3000/api/v1/login',
        method: 'POST',
        connections: 100,
        duration: 10,
        timeout: 5,
        pipelining: 1,
        latency: true,
        renderStatusCodes: true,
        json: true,
        idReplacement: true,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
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