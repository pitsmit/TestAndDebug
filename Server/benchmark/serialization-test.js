const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class SerializationTestRunner {
    constructor(framework) {
        this.framework = framework;
        this.runNumber = process.env.RUN_NUMBER || 1;
        this.resultsDir = `/app/results/${this.framework}/run-${this.runNumber}`;

        fs.mkdirSync(this.resultsDir, { recursive: true });
        console.log(`🎯 SerializationTestRunner for ${this.framework}, run ${this.runNumber}`);
    }

    async run() {
        try {
            const testFile = `serialization-test/${this.framework}.js`;
            const output = execSync(`node ${testFile}`, {
                encoding: 'utf8',
                stdio: 'pipe',
                timeout: 60000
            });

            console.log(`📋 Test output: ${output}`);

            const match = output.match(/✅.*?(\d+\.?\d*) req\/sec/);
            const rps = match ? parseFloat(match[1]) : 0;

            const result = {
                run: parseInt(this.runNumber),
                framework: this.framework,
                requestsPerSecond: rps,
                timestamp: new Date().toISOString(),
                status: 'success'
            };

            this.saveResult(result);
            console.log(`✅ Run ${this.runNumber} completed: ${rps} req/sec`);
            return result;

        } catch (error) {
            console.error(`❌ Run ${this.runNumber} failed:`, error.message);
            const result = {
                run: parseInt(this.runNumber),
                framework: this.framework,
                requestsPerSecond: 0,
                timestamp: new Date().toISOString(),
                status: 'failed',
                error: error.message
            };
            this.saveResult(result);
            return result;
        }
    }

    saveResult(result) {
        const jsonFile = path.join(this.resultsDir, `serialization.json`);
        fs.writeFileSync(jsonFile, JSON.stringify(result, null, 2));
    }
}

const framework = process.argv[2];
const runner = new SerializationTestRunner(framework);
runner.run().catch(error => {
    console.error(error);
    process.exit(1);
});