const { execSync } = require('child_process');
const fs = require('fs');

class BenchmarkRunner {
    constructor(framework, totalRuns = 5) {
        this.framework = framework;
        this.totalRuns = totalRuns;
        this.results = [];
    }

    async runSingleTest(runNumber) {
        console.log(`\n🚀 Run ${runNumber}/${this.totalRuns} for ${this.framework}`);

        // Запускаем один тест
        const testFile = `test-${this.framework}.js`;
        const output = execSync(`node ${testFile}`, { encoding: 'utf8' });

        // Парсим результат
        const match = output.match(/✅.*?(\d+\.?\d*) req\/sec/);
        const rps = match ? parseFloat(match[1]) : 0;

        return {
            run: runNumber,
            timestamp: new Date().toISOString(),
            requestsPerSecond: rps,
            framework: this.framework
        };
    }

    async runAllTests() {
        console.log(`🎯 Starting ${this.totalRuns} runs for ${this.framework}`);

        for (let i = 1; i <= this.totalRuns; i++) {
            try {
                const result = await this.runSingleTest(i);
                this.results.push(result);

                // Прогресс каждые 10 прогонов
                if (i % 10 === 0) {
                    console.log(`📊 Completed ${i}/${this.totalRuns} runs`);
                }

                // Пауза между прогонами
                if (i < this.totalRuns) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error) {
                console.error(`❌ Run ${i} failed:`, error.message);
            }
        }

        this.saveResults();
        this.generateReport();
    }

    saveResults() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `benchmark-${this.framework}-${timestamp}`;

        // JSON для анализа
        fs.writeFileSync(
            `/app/results/${filename}.json`,
            JSON.stringify(this.results, null, 2)
        );

        // CSV для Excel
        const csv = this.convertToCSV();
        fs.writeFileSync(`/app/results/${filename}.csv`, csv);

        console.log(`💾 Results saved to ${filename}.{json,csv}`);
    }

    convertToCSV() {
        const headers = ['Run', 'Framework', 'RequestsPerSecond', 'Timestamp'];
        const rows = this.results.map(r => [
            r.run,
            r.framework,
            r.requestsPerSecond,
            r.timestamp
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    generateReport() {
        const validResults = this.results.filter(r => r.requestsPerSecond > 0);
        const rpsValues = validResults.map(r => r.requestsPerSecond);

        const stats = {
            framework: this.framework,
            totalRuns: this.results.length,
            successfulRuns: validResults.length,
            averageRPS: this.calculateAverage(rpsValues),
            minRPS: Math.min(...rpsValues),
            maxRPS: Math.max(...rpsValues),
            p50: this.calculatePercentile(rpsValues, 50),
            p75: this.calculatePercentile(rpsValues, 75),
            p90: this.calculatePercentile(rpsValues, 90),
            p95: this.calculatePercentile(rpsValues, 95),
            p99: this.calculatePercentile(rpsValues, 99)
        };

        console.log('\n📈 FINAL REPORT');
        console.log('='.repeat(50));
        console.log(`Framework: ${stats.framework}`);
        console.log(`Runs: ${stats.successfulRuns}/${stats.totalRuns} successful`);
        console.log(`Average RPS: ${stats.averageRPS.toFixed(0)}`);
        console.log(`Range: ${stats.minRPS.toFixed(0)} - ${stats.maxRPS.toFixed(0)}`);
        console.log(`Percentiles:`);
        console.log(`  P50: ${stats.p50.toFixed(0)}  P75: ${stats.p75.toFixed(0)}`);
        console.log(`  P90: ${stats.p90.toFixed(0)}  P95: ${stats.p95.toFixed(0)}`);
        console.log(`  P99: ${stats.p99.toFixed(0)}`);

        // Сохраняем статистику
        fs.writeFileSync(
            `/app/results/stats-${this.framework}.json`,
            JSON.stringify(stats, null, 2)
        );
    }

    calculateAverage(arr) {
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    }

    calculatePercentile(arr, p) {
        const sorted = [...arr].sort((a, b) => a - b);
        const index = (p / 5) * (sorted.length - 1);
        return sorted[Math.floor(index)];
    }
}

// Запуск
const framework = process.argv[2] || 'express';
const runs = parseInt(process.argv[3]) || 5;

const runner = new BenchmarkRunner(framework, runs);
runner.runAllTests().catch(console.error);