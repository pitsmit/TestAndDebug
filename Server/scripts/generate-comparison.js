const fs = require('fs');
const path = require('path');

class ComparisonGenerator {
    constructor(totalRuns, resultFileName) {
        this.totalRuns = totalRuns;
        this.resultFileName = resultFileName;
        this.results = {
            express: null,
            fastify: null
        };
    }

    loadFrameworkStats(framework) {
        const possiblePaths = [
            path.join(__dirname, '..', '..', 'final-results', framework, `complete-stats-${this.resultFileName}.json`),
            path.join(__dirname, '..', '..', 'final-results', framework, `final-stats-${this.resultFileName}.json`),
            path.join(__dirname, '..', '..', 'final-results', framework, `final-stats.json`)
        ];

        for (const statsPath of possiblePaths) {
            if (fs.existsSync(statsPath)) {
                try {
                    const content = fs.readFileSync(statsPath, 'utf8');
                    this.results[framework] = JSON.parse(content);
                    console.log(`✅ Loaded ${framework} stats from ${path.basename(statsPath)}`);
                    return;
                } catch (error) {
                    console.log(`❌ Failed to load ${framework} stats: ${error.message}`);
                }
            }
        }

        console.log(`⚠️  No stats found for ${framework}`);

        const finalDir = path.join(__dirname, '..', '..', 'final-results', framework);
        if (fs.existsSync(finalDir)) {
            const files = fs.readdirSync(finalDir);
            console.log(`📁 Available files in ${framework}:`, files);
        }
    }

    generateComparison() {
        console.log('\n' + '='.repeat(80));
        console.log('🚀 PERFORMANCE COMPARISON: Express vs Fastify');
        console.log('='.repeat(80));

        if (!this.results.express || !this.results.fastify) {
            console.log('❌ Cannot generate comparison - missing framework data');
            return;
        }

        const express = this.results.express;
        const fastify = this.results.fastify;

        // 📊 Извлекаем данные
        const expressSummary = express.summary || {};
        const fastifySummary = fastify.summary || {};

        const expressRPS = expressSummary.requests_per_second?.average || 0;
        const fastifyRPS = fastifySummary.requests_per_second?.average || 0;

        const expressLatency = expressSummary.latency || {};
        const fastifyLatency = fastifySummary.latency || {};

        const expressThroughput = expressSummary.throughput?.average || 0;
        const fastifyThroughput = fastifySummary.throughput?.average || 0;

        const expressErrors = expressSummary.errors_summary?.total_errors || 0;
        const fastifyErrors = fastifySummary.errors_summary?.total_errors || 0;

        const expressErrorRate = expressSummary.errors_summary?.error_rate || '0%';
        const fastifyErrorRate = fastifySummary.errors_summary?.error_rate || '0%';

        // 📈 Рассчитываем разницу
        const rpsDifference = ((fastifyRPS - expressRPS) / expressRPS * 100);
        const throughputDifference = ((fastifyThroughput - expressThroughput) / expressThroughput * 100);

        const winner = fastifyRPS > expressRPS ? 'Fastify' : 'Express';
        const performanceGap = Math.abs(rpsDifference).toFixed(1);

        // 🎯 Выводим детальное сравнение
        this.printDetailedComparison({
            expressRPS, fastifyRPS, rpsDifference,
            expressLatency, fastifyLatency,
            expressThroughput, fastifyThroughput, throughputDifference,
            expressErrors, fastifyErrors,
            expressErrorRate, fastifyErrorRate,
            winner, performanceGap
        });

        // 💾 Сохраняем полный отчет
        this.saveComparisonReport({
            express, fastify,
            expressRPS, fastifyRPS, rpsDifference,
            expressLatency, fastifyLatency,
            expressThroughput, fastifyThroughput, throughputDifference,
            expressErrors, fastifyErrors,
            winner, performanceGap
        });

        // 📄 Генерируем HTML отчет
        this.generateHTMLReport({
            expressRPS, fastifyRPS, rpsDifference,
            expressLatency, fastifyLatency,
            expressThroughput, fastifyThroughput, throughputDifference,
            expressErrors, fastifyErrors,
            expressErrorRate, fastifyErrorRate,
            winner, performanceGap
        });
    }

    printDetailedComparison(data) {
        const {
            expressRPS, fastifyRPS, rpsDifference,
            expressLatency, fastifyLatency,
            expressThroughput, fastifyThroughput, throughputDifference,
            expressErrors, fastifyErrors,
            expressErrorRate, fastifyErrorRate,
            winner, performanceGap
        } = data;

        console.log(`\n📊 TEST CONFIGURATION`);
        console.log('─'.repeat(40));
        console.log(`Total Runs per Framework: ${this.totalRuns}`);
        console.log(`Test Type: ${this.resultFileName}`);
        console.log(`Timestamp: ${new Date().toISOString()}`);

        console.log(`\n🏆 PERFORMANCE SUMMARY`);
        console.log('─'.repeat(40));
        console.log(`🎯 Winner: ${winner} (${performanceGap}% faster)`);
        console.log(`📈 RPS Difference: ${rpsDifference > 0 ? '+' : ''}${rpsDifference.toFixed(1)}%`);
        console.log(`💾 Throughput Difference: ${throughputDifference > 0 ? '+' : ''}${throughputDifference.toFixed(1)}%`);

        console.log(`\n📈 REQUESTS PER SECOND (RPS)`);
        console.log('─'.repeat(40));
        console.log(`Framework    | Average RPS | Min       | Max       | Std Dev`);
        console.log(`------------ | ----------- | --------- | --------- | ---------`);
        console.log(`Express      | ${expressRPS.toFixed(0).padEnd(11)} | ${this.getMinMax(expressRPS, 'min').padEnd(9)} | ${this.getMinMax(expressRPS, 'max').padEnd(9)} | ${this.getStdDev(expressRPS).padEnd(9)}`);
        console.log(`Fastify      | ${fastifyRPS.toFixed(0).padEnd(11)} | ${this.getMinMax(fastifyRPS, 'min').padEnd(9)} | ${this.getMinMax(fastifyRPS, 'max').padEnd(9)} | ${this.getStdDev(fastifyRPS).padEnd(9)}`);

        console.log(`\n⏱️  LATENCY PERCENTILES (ms)`);
        console.log('─'.repeat(40));
        console.log(`Framework    | p50    | p75    | p90    | p95    | p99    `);
        console.log(`------------ | ------ | ------ | ------ | ------ | ------`);
        console.log(`Express      | ${this.formatLatency(expressLatency.p50)} | ${this.formatLatency(expressLatency.p75)} | ${this.formatLatency(expressLatency.p90)} | ${this.formatLatency(expressLatency.p95)} | ${this.formatLatency(expressLatency.p99)}`);
        console.log(`Fastify      | ${this.formatLatency(fastifyLatency.p50)} | ${this.formatLatency(fastifyLatency.p75)} | ${this.formatLatency(fastifyLatency.p90)} | ${this.formatLatency(fastifyLatency.p95)} | ${this.formatLatency(fastifyLatency.p99)}`);

        console.log(`\n💾 THROUGHPUT (bytes/sec)`);
        console.log('─'.repeat(40));
        console.log(`Framework    | Average     | Min         | Max         `);
        console.log(`------------ | ----------- | ----------- | -----------`);
        console.log(`Express      | ${this.formatBytes(expressThroughput).padEnd(11)} | ${this.formatBytes(this.getMinMax(expressThroughput, 'min')).padEnd(11)} | ${this.formatBytes(this.getMinMax(expressThroughput, 'max')).padEnd(11)}`);
        console.log(`Fastify      | ${this.formatBytes(fastifyThroughput).padEnd(11)} | ${this.formatBytes(this.getMinMax(fastifyThroughput, 'min')).padEnd(11)} | ${this.formatBytes(this.getMinMax(fastifyThroughput, 'max')).padEnd(11)}`);

        console.log(`\n⚠️  ERROR STATISTICS`);
        console.log('─'.repeat(40));
        console.log(`Framework    | Total Errors | Error Rate | Success Rate`);
        console.log(`------------ | ------------ | ---------- | ------------`);
        console.log(`Express      | ${expressErrors.toString().padEnd(12)} | ${expressErrorRate.padEnd(9)} | ${this.calculateSuccessRate(expressErrorRate).padEnd(11)}`);
        console.log(`Fastify      | ${fastifyErrors.toString().padEnd(12)} | ${fastifyErrorRate.padEnd(9)} | ${this.calculateSuccessRate(fastifyErrorRate).padEnd(11)}`);
    }

    formatLatency(value) {
        if (!value) return 'N/A  ';
        return value.toFixed(1).padEnd(5);
    }

    formatBytes(bytes) {
        if (!bytes) return 'N/A';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    getMinMax(data, type) {
        if (typeof data === 'object' && data[type]) return data[type].toFixed(0);
        return 'N/A';
    }

    getStdDev(data) {
        if (typeof data === 'object' && data.stddev) return data.stddev.toFixed(0);
        return 'N/A';
    }

    calculateSuccessRate(errorRate) {
        const rate = parseFloat(errorRate);
        return isNaN(rate) ? '100.00%' : (100 - rate).toFixed(2) + '%';
    }

    saveComparisonReport(data) {
        const comparison = {
            metadata: {
                timestamp: new Date().toISOString(),
                total_runs: this.totalRuns,
                test_type: this.resultFileName,
                test_description: "JSON serialization performance test"
            },
            performance_summary: {
                winner: data.winner,
                performance_gap: data.performanceGap + '%',
                rps_difference: data.rpsDifference.toFixed(1) + '%',
                throughput_difference: data.throughputDifference.toFixed(1) + '%'
            },
            detailed_comparison: {
                requests_per_second: {
                    express: this.cleanMetric(data.expressRPS),
                    fastify: this.cleanMetric(data.fastifyRPS)
                },
                latency: {
                    express: data.expressLatency,
                    fastify: data.fastifyLatency
                },
                throughput: {
                    express: this.cleanMetric(data.expressThroughput),
                    fastify: this.cleanMetric(data.fastifyThroughput)
                },
                reliability: {
                    express: {
                        total_errors: data.expressErrors
                    },
                    fastify: {
                        total_errors: data.fastifyErrors
                    }
                }
            }
        };

        const comparisonDir = path.join(__dirname, '..', '..', 'comparison-data');
        fs.mkdirSync(comparisonDir, { recursive: true });

        fs.writeFileSync(
            path.join(comparisonDir, `comparison-report-${this.resultFileName}.json`),
            JSON.stringify(comparison, null, 2)
        );

        console.log(`\n💾 Comparison report saved to: comparison-data/comparison-report-${this.resultFileName}.json`);
    }

    cleanMetric(metric) {
        if (typeof metric === 'object') {
            return {
                average: metric.average,
                min: metric.min,
                max: metric.max,
                stddev: metric.stddev
            };
        }
        return metric;
    }

    generateHTMLReport(data) {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Comparison: Express vs Fastify</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .winner-badge { background: #4CAF50; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 10px 0; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff; }
        .metric-value { font-size: 24px; font-weight: bold; color: #333; }
        .metric-label { color: #666; font-size: 14px; }
        .comparison-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .comparison-table th, .comparison-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .comparison-table th { background: #f8f9fa; }
        .positive { color: #4CAF50; }
        .negative { color: #f44336; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Performance Comparison: Express vs Fastify</h1>
            <div class="winner-badge">
                Winner: ${data.winner} (${data.performanceGap}% faster)
            </div>
            <p>Test Type: ${this.resultFileName} | Runs: ${this.totalRuns} | Date: ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${data.expressRPS.toFixed(0)}</div>
                <div class="metric-label">Express RPS</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.fastifyRPS.toFixed(0)}</div>
                <div class="metric-label">Fastify RPS</div>
            </div>
            <div class="metric-card">
                <div class="metric-value ${data.rpsDifference > 0 ? 'positive' : 'negative'}">
                    ${data.rpsDifference > 0 ? '+' : ''}${data.rpsDifference.toFixed(1)}%
                </div>
                <div class="metric-label">Performance Difference</div>
            </div>
        </div>

        <h2>📊 Detailed Metrics</h2>
        <table class="comparison-table">
            <tr>
                <th>Metric</th>
                <th>Express</th>
                <th>Fastify</th>
                <th>Difference</th>
            </tr>
            <tr>
                <td>Requests Per Second</td>
                <td>${data.expressRPS.toFixed(0)}</td>
                <td>${data.fastifyRPS.toFixed(0)}</td>
                <td class="${data.rpsDifference > 0 ? 'positive' : 'negative'}">
                    ${data.rpsDifference > 0 ? '+' : ''}${data.rpsDifference.toFixed(1)}%
                </td>
            </tr>
            <tr>
                <td>Throughput</td>
                <td>${this.formatBytes(data.expressThroughput)}/s</td>
                <td>${this.formatBytes(data.fastifyThroughput)}/s</td>
                <td class="${data.throughputDifference > 0 ? 'positive' : 'negative'}">
                    ${data.throughputDifference > 0 ? '+' : ''}${data.throughputDifference.toFixed(1)}%
                </td>
            </tr>
            <tr>
                <td>Latency p99</td>
                <td>${data.expressLatency.p99 ? data.expressLatency.p99.toFixed(1) + 'ms' : 'N/A'}</td>
                <td>${data.fastifyLatency.p99 ? data.fastifyLatency.p99.toFixed(1) + 'ms' : 'N/A'}</td>
                <td>-</td>
            </tr>
            <tr>
                <td>Total Errors</td>
                <td>${data.expressErrors}</td>
                <td>${data.fastifyErrors}</td>
                <td>${data.fastifyErrors - data.expressErrors}</td>
            </tr>
        </table>
    </div>
</body>
</html>`;

        const comparisonDir = path.join(__dirname, '..', '..', 'comparison-data');
        fs.writeFileSync(
            path.join(comparisonDir, `comparison-report-${this.resultFileName}.html`),
            html
        );

        console.log(`📄 HTML report saved to: comparison-data/comparison-report-${this.resultFileName}.html`);
    }
}

const totalRuns = parseInt(process.argv[2]);
const resultFileName = process.argv[3];
const generator = new ComparisonGenerator(totalRuns, resultFileName);
generator.loadFrameworkStats('express');
generator.loadFrameworkStats('fastify');
generator.generateComparison();