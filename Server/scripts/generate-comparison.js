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
        const statsPath = path.join(__dirname, '..', '..', 'comparison-data', framework, `final-stats-${this.resultFileName}.json`);

        console.log(`📁 Looking for ${framework} stats at: ${statsPath}`);

        if (fs.existsSync(statsPath)) {
            try {
                const content = fs.readFileSync(statsPath, 'utf8');
                this.results[framework] = JSON.parse(content);
                console.log(`✅ Loaded ${framework} stats`);
            } catch (error) {
                console.log(`❌ Failed to load ${framework} stats: ${error.message}`);
            }
        } else {
            console.log(`⚠️  No stats found for ${framework} at ${statsPath}`);
        }
    }

    generateComparison() {
        console.log('\n📊 COMPARISON REPORT');
        console.log('=' .repeat(50));
        console.log(`Total runs per framework: ${this.totalRuns}`);

        if (this.results.express && this.results.fastify) {
            const express = this.results.express;
            const fastify = this.results.fastify;

            console.log(`\nFramework        | Express    | Fastify    | Difference`);
            console.log(`-----------------|------------|------------|------------`);
            console.log(`Successful Runs  | ${express.successfulRuns.toString().padEnd(10)} | ${fastify.successfulRuns.toString().padEnd(10)} | ${(fastify.successfulRuns - express.successfulRuns).toString().padEnd(10)}`);
            console.log(`Average RPS      | ${express.averageRPS.toFixed(0).padEnd(10)} | ${fastify.averageRPS.toFixed(0).padEnd(10)} | ${(fastify.averageRPS - express.averageRPS).toFixed(0).padEnd(10)}`);
            console.log(`Success Rate     | ${express.successRate.padEnd(10)} | ${fastify.successRate.padEnd(10)} | -`);

            const difference = ((fastify.averageRPS - express.averageRPS) / express.averageRPS * 100).toFixed(1);
            console.log(`\n🎯 Performance Difference: ${difference}%`);

            if (fastify.averageRPS > express.averageRPS) {
                console.log(`🚀 Fastify is ${Math.abs(difference)}% faster than Express`);
            } else {
                console.log(`🚀 Express is ${Math.abs(difference)}% faster than Fastify`);
            }

            const comparison = {
                timestamp: new Date().toISOString(),
                totalRuns: this.totalRuns,
                comparison: {
                    express: express,
                    fastify: fastify,
                    difference: {
                        rps: fastify.averageRPS - express.averageRPS,
                        percentage: parseFloat(difference),
                        winner: fastify.averageRPS > express.averageRPS ? 'fastify' : 'express'
                    }
                }
            };

            const comparisonDir = path.join(__dirname, '..', '..', 'comparison-data');
            fs.mkdirSync(comparisonDir, { recursive: true });
            fs.writeFileSync(
                path.join(comparisonDir, 'comparison-report.json'),
                JSON.stringify(comparison, null, 2)
            );

            console.log(`\n💾 Comparison report saved to: comparison-data/comparison-report.json`);

        } else {
            console.log('❌ Cannot generate comparison - missing data');
            if (!this.results.express) console.log('  - Express results missing');
            if (!this.results.fastify) console.log('  - Fastify results missing');
        }
    }
}

const totalRuns = parseInt(process.argv[2]);
const resultFileName = process.argv[3];
const generator = new ComparisonGenerator(totalRuns, resultFileName);
generator.loadFrameworkStats('express');
generator.loadFrameworkStats('fastify');
generator.generateComparison();