const fs = require('fs');
const path = require('path');

class ResultsAggregator {
    constructor(framework, totalRuns) {
        this.framework = framework;
        this.totalRuns = totalRuns;
        this.results = [];
    }

    loadResults() {
        const resultsDir = path.join(__dirname, '..', 'final-results', this.framework);

        for (let i = 1; i <= this.totalRuns; i++) {
            const resultFile = path.join(resultsDir, `result-run-${i}.json`);
            if (fs.existsSync(resultFile)) {
                try {
                    const content = fs.readFileSync(resultFile, 'utf8');
                    this.results.push(JSON.parse(content));
                } catch (error) {
                    console.log(`❌ Error loading run ${i}: ${error.message}`);
                }
            }
        }

        if (this.results.length === 0) {
            const allJsonFiles = path.join(resultsDir, '*.json');
            console.log(`No individual run files found. Looking for: ${allJsonFiles}`);
        }
    }

    generateFinalReport() {
        const successful = this.results.filter(r => r.status === 'success' && r.requestsPerSecond > 0);

        if (successful.length === 0) {
            console.log(`❌ No successful runs for ${this.framework}`);
            console.log(`All results:`, JSON.stringify(this.results, null, 2));
            return;
        }

        const rpsValues = successful.map(r => r.requestsPerSecond);
        const stats = {
            framework: this.framework,
            totalRuns: this.totalRuns,
            successfulRuns: successful.length,
            successRate: (successful.length / this.totalRuns * 100).toFixed(1) + '%',
            averageRPS: this.calculateAverage(rpsValues),
            minRPS: Math.min(...rpsValues),
            maxRPS: Math.max(...rpsValues),
            stdDev: this.calculateStdDev(rpsValues)
        };

        console.log('\n📊 FINAL AGGREGATED REPORT');
        console.log('=' .repeat(40));
        console.log(`Framework: ${stats.framework}`);
        console.log(`Total Runs: ${stats.totalRuns}`);
        console.log(`Successful: ${stats.successfulRuns} (${stats.successRate})`);
        console.log(`Average RPS: ${stats.averageRPS.toFixed(0)}`);
        console.log(`Range: ${stats.minRPS.toFixed(0)} - ${stats.maxRPS.toFixed(0)}`);
        console.log(`Std Dev: ${stats.stdDev.toFixed(0)}`);

        const finalDir = path.join(__dirname, '..', 'final-results', this.framework);
        fs.mkdirSync(finalDir, { recursive: true });
        fs.writeFileSync(
            path.join(finalDir, 'final-stats.json'),
            JSON.stringify(stats, null, 2)
        );
    }

    calculateAverage(arr) {
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    }

    calculateStdDev(arr) {
        const avg = this.calculateAverage(arr);
        const squareDiffs = arr.map(value => Math.pow(value - avg, 2));
        return Math.sqrt(this.calculateAverage(squareDiffs));
    }
}

const framework = process.argv[2];
const totalRuns = parseInt(process.argv[3]) || 5;
const aggregator = new ResultsAggregator(framework, totalRuns);
aggregator.loadResults();
aggregator.generateFinalReport();