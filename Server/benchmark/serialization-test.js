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
        const testFile = `serialization-test/${this.framework}.js`;
        const result = execSync(`node ${testFile}`, {
            encoding: 'utf8',
            stdio: 'pipe',
            timeout: 60000
        });

        console.log(`📋 Test output: ${JSON.stringify(result, null, 2)}`);

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