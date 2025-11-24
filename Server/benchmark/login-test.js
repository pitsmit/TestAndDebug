const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class LoginTestRunner {
    constructor(framework) {
        this.framework = framework;
        this.runNumber = process.env.RUN_NUMBER || 1;
        this.resultsDir = `/app/results/${this.framework}/run-${this.runNumber}`;

        fs.mkdirSync(this.resultsDir, { recursive: true });
        console.log(`🎯 LoginTestRunner for ${this.framework}, run ${this.runNumber}`);
    }

    async run() {
        const testFile = `login-test/${this.framework}.js`;
        const result = execSync(`node ${testFile}`, {
            encoding: 'utf8',
            stdio: 'pipe',
            timeout: 60000
        });

        const formattedResult = JSON.stringify(JSON.parse(result), null, 2);

        console.log(`📋 Test output: ${formattedResult}`);

        const jsonFile = path.join(this.resultsDir, `login.json`);
        fs.writeFileSync(jsonFile, formattedResult);
    }
}

const framework = process.argv[2];
const runner = new LoginTestRunner(framework);
runner.run().catch(error => {
    console.error(error);
    process.exit(1);
});