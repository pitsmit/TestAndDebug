const fs = require('fs');
const path = require('html');

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
        // ✅ Ищем разные варианты имен файлов
        const possiblePaths = [
            path.join(__dirname, '..', '..', 'final-results', framework, `complete-stats-${this.resultFileName}.json`),
            path.join(__dirname, '..', '..', 'final-results', framework, `final-stats-${this.resultFileName}.json`),
            path.join(__dirname, '..', '..', 'final-results', framework, `final-stats.json`)
        ];

        for (const statsPath of possiblePaths) {
            console.log(`📁 Looking for ${framework} stats at: ${statsPath}`);

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

        // ✅ Отладочная информация
        const finalDir = path.join(__dirname, '..', '..', 'final-results', framework);
        if (fs.existsSync(finalDir)) {
            const files = fs.readdirSync(finalDir);
            console.log(`📁 Available files in ${framework}:`, files);
        }
    }

    generateComparison() {
        console.log('\n📊 COMPARISON REPORT');
        console.log('=' .repeat(50));
        console.log(`Total runs per framework: ${this.totalRuns}`);
        console.log(`Test type: ${this.resultFileName}`);

        if (this.results.express && this.results.fastify) {
            const express = this.results.express;
            const fastify = this.results.fastify;

            // ✅ Извлекаем данные из новой структуры
            const expressRPS = express.summary?.requests_per_second?.average || express.averageRPS || 0;
            const fastifyRPS = fastify.summary?.requests_per_second?.average || fastify.averageRPS || 0;
            const expressRuns = express.successful_runs || express.successfulRuns || 0;
            const fastifyRuns = fastify.successful_runs || fastify.successfulRuns || 0;
            const expressErrors = express.summary?.errors_summary?.total_errors || 0;
            const fastifyErrors = fastify.summary?.errors_summary?.total_errors || 0;

            console.log(`\nFramework        | Express    | Fastify    | Difference`);
            console.log(`-----------------|------------|------------|------------`);
            console.log(`Successful Runs  | ${expressRuns.toString().padEnd(10)} | ${fastifyRuns.toString().padEnd(10)} | ${(fastifyRuns - expressRuns).toString().padEnd(10)}`);
            console.log(`Average RPS      | ${expressRPS.toFixed(0).padEnd(10)} | ${fastifyRPS.toFixed(0).padEnd(10)} | ${(fastifyRPS - expressRPS).toFixed(0).padEnd(10)}`);
            console.log(`Total Errors     | ${expressErrors.toString().padEnd(10)} | ${fastifyErrors.toString().padEnd(10)} | ${(fastifyErrors - expressErrors).toString().padEnd(10)}`);

            const difference = ((fastifyRPS - expressRPS) / expressRPS * 100).toFixed(1);
            console.log(`\n🎯 Performance Difference: ${difference}%`);

            if (fastifyRPS > expressRPS) {
                console.log(`🚀 Fastify is ${Math.abs(difference)}% faster than Express`);
            } else {
                console.log(`🚀 Express is ${Math.abs(difference)}% faster than Fastify`);
            }

            // ✅ Сохраняем сравнение в JSON
            const comparison = {
                timestamp: new Date().toISOString(),
                total_runs: this.totalRuns,
                test_type: this.resultFileName,
                comparison: {
                    express: this.cleanData(express),
                    fastify: this.cleanData(fastify),
                    difference: {
                        rps: fastifyRPS - expressRPS,
                        percentage: parseFloat(difference),
                        winner: fastifyRPS > expressRPS ? 'fastify' : 'express'
                    }
                }
            };

            const comparisonDir = path.join(__dirname, '..', '..', 'comparison-data');
            fs.mkdirSync(comparisonDir, { recursive: true });

            fs.writeFileSync(
                path.join(comparisonDir, `comparison-report-${this.resultFileName}.json`),
                JSON.stringify(comparison, null, 2)
            );

            // ✅ Генерируем HTML отчет
            this.generateHTMLReport(comparison);

            console.log(`\n💾 Comparison report saved to: comparison-data/comparison-report-${this.resultFileName}.json`);
            console.log(`💾 HTML report saved to: comparison-data/comparison-report-${this.resultFileName}.html`);

        } else {
            console.log('❌ Cannot generate comparison - missing data');
            if (!this.results.express) console.log('  - Express results missing');
            if (!this.results.fastify) console.log('  - Fastify results missing');
        }
    }

    cleanData(data) {
        // ✅ Убираем циклические ссылки и большие массивы для JSON
        return {
            framework: data.framework,
            test_type: data.test_type,
            total_runs: data.total_runs,
            successful_runs: data.successful_runs,
            summary: data.summary,
            // Не включаем individual_runs и chart_data чтобы не делать файл огромным
            aggregation_timestamp: data.aggregation_timestamp
        };
    }

    generateHTMLReport(comparison) {
        const express = comparison.comparison.express;
        const fastify = comparison.comparison.fastify;
        const difference = comparison.comparison.difference;

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Benchmark Comparison Report - ${comparison.test_type}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #2c3e50, #34495e);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 300;
        }
        
        .header .subtitle {
            font-size: 1.2em;
            opacity: 0.9;
            font-weight: 300;
        }
        
        .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        
        .card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            border-left: 4px solid #3498db;
        }
        
        .card.express {
            border-left-color: #e74c3c;
        }
        
        .card.fastify {
            border-left-color: #27ae60;
        }
        
        .card.winner {
            border-left-color: #f39c12;
            background: linear-gradient(135deg, #fff, #fef9e7);
        }
        
        .card h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 1.3em;
        }
        
        .metric {
            display: flex;
            margin: 8px 0;
            padding: 8px 0;
            border-bottom: 1px solid #ecf0f1;
        }
        
        .metric .label {
            flex: 1;
            color: #7f8c8d;
        }
        
        .metric .value {
            font-weight: 600;
            color: #2c3e50;
        }
        
        .metric .value.highlight {
            color: #e74c3c;
            font-size: 1.1em;
        }
        
        .charts {
            padding: 30px;
            background: white;
        }
        
        .chart-container {
            margin: 30px 0;
            padding: 20px;
            border: 1px solid #e1e8ed;
            border-radius: 10px;
            background: #fafbfc;
        }
        
        .chart-container h3 {
            color: #2c3e50;
            margin-bottom: 20px;
            text-align: center;
            font-size: 1.4em;
        }
        
        .winner-banner {
            background: linear-gradient(135deg, #f39c12, #e67e22);
            color: white;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
            border-radius: 10px;
            font-size: 1.3em;
            font-weight: 600;
        }
        
        .footer {
            background: #34495e;
            color: white;
            text-align: center;
            padding: 20px;
            font-size: 0.9em;
        }
        
        .rps-badge {
            display: inline-block;
            background: #3498db;
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.9em;
            margin-left: 10px;
        }
        
        .latency-badge {
            display: inline-block;
            background: #9b59b6;
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.9em;
            margin-left: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Benchmark Comparison Report</h1>
            <div class="subtitle">
                ${comparison.test_type.toUpperCase()} Test • ${comparison.total_runs} Runs • ${new Date(comparison.timestamp).toLocaleDateString()}
            </div>
        </div>
        
        <div class="winner-banner">
            🏆 ${difference.winner.toUpperCase()} is ${Math.abs(difference.percentage)}% faster!
        </div>

        <div class="summary-cards">
            <div class="card express">
                <h3>📊 Express</h3>
                <div class="metric">
                    <span class="label">Requests/Second</span>
                    <span class="value highlight">${express.summary?.requests_per_second?.average?.toFixed(0) || 0}</span>
                </div>
                <div class="metric">
                    <span class="label">Successful Runs</span>
                    <span class="value">${express.successful_runs}/${express.total_runs}</span>
                </div>
                <div class="metric">
                    <span class="label">P99 Latency</span>
                    <span class="value">${express.summary?.latency_p99?.average?.toFixed(1) || 0}ms</span>
                </div>
                <div class="metric">
                    <span class="label">Total Errors</span>
                    <span class="value">${express.summary?.errors_summary?.total_errors || 0}</span>
                </div>
            </div>
            
            <div class="card fastify">
                <h3>⚡ Fastify</h3>
                <div class="metric">
                    <span class="label">Requests/Second</span>
                    <span class="value highlight">${fastify.summary?.requests_per_second?.average?.toFixed(0) || 0}</span>
                </div>
                <div class="metric">
                    <span class="label">Successful Runs</span>
                    <span class="value">${fastify.successful_runs}/${fastify.total_runs}</span>
                </div>
                <div class="metric">
                    <span class="label">P99 Latency</span>
                    <span class="value">${fastify.summary?.latency_p99?.average?.toFixed(1) || 0}ms</span>
                </div>
                <div class="metric">
                    <span class="label">Total Errors</span>
                    <span class="value">${fastify.summary?.errors_summary?.total_errors || 0}</span>
                </div>
            </div>
            
            <div class="card winner">
                <h3>📈 Performance Difference</h3>
                <div class="metric">
                    <span class="label">RPS Difference</span>
                    <span class="value">+${difference.rps.toFixed(0)}</span>
                </div>
                <div class="metric">
                    <span class="label">Performance Gain</span>
                    <span class="value">${difference.percentage}%</span>
                </div>
                <div class="metric">
                    <span class="label">Winner</span>
                    <span class="value">${difference.winner.toUpperCase()}</span>
                </div>
                <div class="metric">
                    <span class="label">Test Duration</span>
                    <span class="value">${comparison.total_runs} runs</span>
                </div>
            </div>
        </div>

        <div class="charts">
            <div class="chart-container">
                <h3>📈 Requests Per Second Comparison</h3>
                <canvas id="rpsChart" width="400" height="200"></canvas>
            </div>
            
            <div class="chart-container">
                <h3>⏱️ P99 Latency Comparison</h3>
                <canvas id="latencyChart" width="400" height="200"></canvas>
            </div>
        </div>

        <div class="footer">
            <p>Generated on ${new Date(comparison.timestamp).toLocaleString()} • Benchmark System</p>
        </div>
    </div>

    <script>
        // RPS Comparison Chart
        new Chart(document.getElementById('rpsChart'), {
            type: 'bar',
            data: {
                labels: ['Express', 'Fastify'],
                datasets: [{
                    label: 'Requests Per Second',
                    data: [${express.summary?.requests_per_second?.average?.toFixed(0) || 0}, ${fastify.summary?.requests_per_second?.average?.toFixed(0) || 0}],
                    backgroundColor: ['#e74c3c', '#27ae60'],
                    borderColor: ['#c0392b', '#229954'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Average RPS Performance' }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Requests/Second' }
                    }
                }
            }
        });

        // Latency Comparison Chart
        new Chart(document.getElementById('latencyChart'), {
            type: 'bar',
            data: {
                labels: ['Express', 'Fastify'],
                datasets: [{
                    label: 'P99 Latency (ms)',
                    data: [${express.summary?.latency_p99?.average?.toFixed(1) || 0}, ${fastify.summary?.latency_p99?.average?.toFixed(1) || 0}],
                    backgroundColor: ['#9b59b6', '#3498db'],
                    borderColor: ['#8e44ad', '#2980b9'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'P99 Latency Comparison' }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Latency (ms)' }
                    }
                }
            }
        });
    </script>
</body>
</html>
        `;

        const comparisonDir = path.join(__dirname, '..', '..', 'comparison-data');
        fs.writeFileSync(
            path.join(comparisonDir, `comparison-report-${this.resultFileName}.html`),
            html
        );
    }
}

const totalRuns = parseInt(process.argv[2]);
const resultFileName = process.argv[3];
const generator = new ComparisonGenerator(totalRuns, resultFileName);
generator.loadFrameworkStats('express');
generator.loadFrameworkStats('fastify');
generator.generateComparison();