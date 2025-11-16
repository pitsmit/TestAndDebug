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

        const expressSummary = express.summary || {};
        const fastifySummary = fastify.summary || {};

        const expressRPS = expressSummary.requests_per_second;
        const fastifyRPS = fastifySummary.requests_per_second;

        const expressLatency = expressSummary.latency;
        const fastifyLatency = fastifySummary.latency;

        const expressThroughput = expressSummary.throughput;
        const fastifyThroughput = fastifySummary.throughput;

        const expressErrors = expressSummary.errors_summary;
        const fastifyErrors = fastifySummary.errors_summary;

        const rpsDifference = ((fastifyRPS.average - expressRPS.average) / expressRPS.average * 100);
        const throughputDifference = ((fastifyThroughput.average - expressThroughput.average) / expressThroughput.average * 100);

        const winner = fastifyRPS.average > expressRPS.average ? 'Fastify' : 'Express';
        const performanceGap = Math.abs(rpsDifference).toFixed(1);

        this.printDetailedComparison({
            expressRPS, fastifyRPS, rpsDifference,
            expressLatency, fastifyLatency,
            expressThroughput, fastifyThroughput, throughputDifference,
            expressErrors, fastifyErrors,
            winner, performanceGap
        });

        this.saveComparisonReport({
            express, fastify,
            expressRPS, fastifyRPS, rpsDifference,
            expressLatency, fastifyLatency,
            expressThroughput, fastifyThroughput, throughputDifference,
            expressErrors, fastifyErrors,
            winner, performanceGap
        });
    }

    printDetailedComparison(data) {
        const {
            expressRPS, fastifyRPS, rpsDifference,
            expressLatency, fastifyLatency,
            expressThroughput, fastifyThroughput, throughputDifference,
            expressErrors, fastifyErrors,
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
        console.log(`Express      | ${expressRPS.average.toFixed(0).padEnd(11)} | ${expressRPS.min.toFixed(0).padEnd(9)} | ${expressRPS.max.toFixed(0).padEnd(9)} | ${expressRPS.stddev.toFixed(0).padEnd(9)}`);
        console.log(`Fastify      | ${fastifyRPS.average.toFixed(0).padEnd(11)} | ${fastifyRPS.min.toFixed(0).padEnd(9)} | ${fastifyRPS.max.toFixed(0).padEnd(9)} | ${fastifyRPS.stddev.toFixed(0).padEnd(9)}`);

        console.log(`\n⏱️  LATENCY PERCENTILES (ms)`);
        console.log('─'.repeat(40));
        console.log(`Framework    | p50    | p75    | p90    | p95    | p99    `);
        console.log(`------------ | ------ | ------ | ------ | ------ | ------`);
        console.log(`Express      | ${this.formatLatency(expressLatency.percentiles.p50)} | ${this.formatLatency(expressLatency.percentiles.p75)} | ${this.formatLatency(expressLatency.percentiles.p90)} | ${this.formatLatency(expressLatency.percentiles.p95)} | ${this.formatLatency(expressLatency.percentiles.p99)}`);
        console.log(`Fastify      | ${this.formatLatency(fastifyLatency.percentiles.p50)} | ${this.formatLatency(fastifyLatency.percentiles.p75)} | ${this.formatLatency(fastifyLatency.percentiles.p90)} | ${this.formatLatency(fastifyLatency.percentiles.p95)} | ${this.formatLatency(fastifyLatency.percentiles.p99)}`);

        console.log(`\n💾 THROUGHPUT (bytes/sec)`);
        console.log('─'.repeat(40));
        console.log(`Framework    | Average     | Min         | Max         `);
        console.log(`------------ | ----------- | ----------- | -----------`);
        console.log(`Express      | ${this.formatBytes(expressThroughput.average).padEnd(11)} | ${this.formatBytes(expressThroughput.min).padEnd(11)} | ${this.formatBytes(expressThroughput.max).padEnd(11)}`);
        console.log(`Fastify      | ${this.formatBytes(fastifyThroughput.average).padEnd(11)} | ${this.formatBytes(fastifyThroughput.min).padEnd(11)} | ${this.formatBytes(fastifyThroughput.max).padEnd(11)}`);

        console.log(`\n⚠️  ERROR STATISTICS`);
        console.log('─'.repeat(40));
        console.log(`Framework    | Total Errors | Error Rate | Success Rate`);
        console.log(`------------ | ------------ | ---------- | ------------`);
        console.log(`Express      | ${expressErrors.total_errors.toString().padEnd(12)} | ${expressErrors.error_rate.padEnd(9)} | ${this.calculateSuccessRate(expressErrors.error_rate).padEnd(11)}`);
        console.log(`Fastify      | ${fastifyErrors.total_errors.toString().padEnd(12)} | ${fastifyErrors.error_rate.padEnd(9)} | ${this.calculateSuccessRate(fastifyErrors.error_rate).padEnd(11)}`);
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
                    express: data.expressRPS,
                    fastify: data.fastifyRPS
                },
                latency: {
                    express: data.expressLatency,
                    fastify: data.fastifyLatency
                },
                throughput: {
                    express: data.expressThroughput,
                    fastify: data.fastifyThroughput
                },
                reliability: {
                    express: data.expressErrors,
                    fastify: data.fastifyErrors
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
}

const totalRuns = parseInt(process.argv[2]);
const resultFileName = process.argv[3];
const generator = new ComparisonGenerator(totalRuns, resultFileName);
generator.loadFrameworkStats('express');
generator.loadFrameworkStats('fastify');
generator.generateComparison();