// Server/benchmark/scripts/resource-monitor.js
const fs = require('fs');
const path = require('path');

class ResourceMonitor {
    constructor(framework, testType, runNumber) {
        this.framework = framework;
        this.testType = testType;
        this.runNumber = runNumber;
        this.metrics = [];
    }

    // Теперь просто сохраняем метрики, сбор происходит в workflow
    addMetrics(metricsData) {
        this.metrics.push({
            timestamp: new Date().toISOString(),
            ...metricsData
        });
    }

    saveMetrics() {
        if (this.metrics.length === 0) {
            console.log('❌ No metrics collected');
            return null;
        }

        const summary = {
            metadata: {
                framework: this.framework,
                test_type: this.testType,
                run_number: this.runNumber,
                timestamp: new Date().toISOString(),
                duration_seconds: this.metrics.length * 2
            },
            resource_usage: {
                cpu: this.calculateStats(this.metrics.map(m => m.cpu_percent)),
                memory: this.calculateStats(this.metrics.map(m => m.memory_mb))
            },
            time_series: this.metrics
        };

        const filename = `metrics-${this.testType}-run-${this.runNumber}.json`;
        const resultsDir = `/app/results/${this.framework}/run-${this.runNumber}`;

        fs.writeFileSync(path.join(resultsDir, filename), JSON.stringify(summary, null, 2));

        console.log(`💾 Saved resource metrics to: ${resultsDir + '/' + filename}`);
        return summary;
    }

    calculateStats(values) {
        const numericValues = values.filter(v => !isNaN(v) && v !== null);
        if (numericValues.length === 0) return { min: 0, max: 0, average: 0, median: 0 };

        return {
            min: Math.min(...numericValues),
            max: Math.max(...numericValues),
            average: Number((numericValues.reduce((a, b) => a + b, 0) / numericValues.length).toFixed(2)),
            median: this.calculateMedian(numericValues)
        };
    }

    calculateMedian(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
    }
}

module.exports = ResourceMonitor;