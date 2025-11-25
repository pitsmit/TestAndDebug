const fs = require('fs');
const path = require('path');

class ResultsAggregator {
    constructor(framework, totalRuns, resultFileName, testType) {
        this.framework = framework;
        this.totalRuns = totalRuns;
        this.resultFileName = resultFileName.replace('.json', '');
        this.rawResults = [];
        this.processedResults = [];
        this.testType = testType;
    }

    createHistogramFromPercentiles(latencyData, totalCount = 10000) {
        const percentiles = [
            { name: 'p0', value: latencyData.min, percentage: 0 },
            { name: 'p1', value: latencyData.percentiles.p1, percentage: 1 },
            { name: 'p2_5', value: latencyData.percentiles.p2_5, percentage: 2.5 },
            { name: 'p10', value: latencyData.percentiles.p10, percentage: 10 },
            { name: 'p25', value: latencyData.percentiles.p25, percentage: 25 },
            { name: 'p50', value: latencyData.percentiles.p50, percentage: 50 },
            { name: 'p75', value: latencyData.percentiles.p75, percentage: 75 },
            { name: 'p90', value: latencyData.percentiles.p90, percentage: 90 },
            { name: 'p95', value: latencyData.percentiles.p95, percentage: 95 },
            { name: 'p99', value: latencyData.percentiles.p99, percentage: 99 },
            { name: 'p99_9', value: latencyData.percentiles.p99_9, percentage: 99.9 },
            { name: 'p99_99', value: latencyData.percentiles.p99_99, percentage: 99.99 },
            { name: 'p100', value: latencyData.max, percentage: 100 }
        ].filter(p => p.value !== undefined);

        const bins = [];

        for (let i = 0; i < percentiles.length - 1; i++) {
            const current = percentiles[i];
            const next = percentiles[i + 1];

            const percentage = next.percentage - current.percentage;
            const count = Math.round(totalCount * (percentage / 100));

            bins.push({
                range: `${current.value}-${next.value}ms`,
                count: count,
                percentage: percentage.toFixed(1) + '%',
                from_percentile: current.name,
                to_percentile: next.name,
                from_percentage: current.percentage,
                to_percentage: next.percentage,
                requests_count: count
            });
        }

        return bins;
    }

    generateHTMLReport(stats, histogramData, resourceData) {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Report - ${this.framework}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff; }
        .metric-value { font-size: 24px; font-weight: bold; color: #333; }
        .metric-label { color: #666; font-size: 14px; }
        .chart-container { margin: 30px 0; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Performance Report - ${this.framework}</h1>
            <p>Test Type: ${this.resultFileName}</p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${stats.summary.requests_per_second.average.toFixed(0)}</div>
                <div class="metric-label">Average RPS</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${stats.summary.latency.average.toFixed(2)}ms</div>
                <div class="metric-label">Average Latency</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${stats.summary.throughput.average.toFixed(0)}</div>
                <div class="metric-label">Average Throughput</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${stats.summary.errors_summary.total_errors}</div>
                <div class="metric-label">Total Errors</div>
            </div>
        </div>

        ${resourceData ? `
        <div class="chart-container">
            <h2>💻 Resource Usage Over Time</h2>
            <canvas id="resourceChart" width="400" height="200"></canvas>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${resourceData.cpu?.average?.toFixed(1) || 0}%</div>
                <div class="metric-label">Avg CPU Usage</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${resourceData.memory?.average?.toFixed(0) || 0}MB</div>
                <div class="metric-label">Avg Memory Usage</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${resourceData.cpu?.max?.toFixed(1) || 0}%</div>
                <div class="metric-label">Max CPU Usage</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${resourceData.memory?.max?.toFixed(0) || 0}MB</div>
                <div class="metric-label">Max Memory Usage</div>
            </div>
        </div>
        ` : ''}

        <div class="chart-container">
            <h2>📊 Latency Distribution Histogram</h2>
            <canvas id="latencyHistogram" width="400" height="200"></canvas>
        </div>

        <div class="chart-container">
            <h2>📈 RPS Distribution</h2>
            <canvas id="rpsChart" width="400" height="200"></canvas>
        </div>

        <h2>📋 Detailed Metrics</h2>
        <table>
            <tr>
                <th>Metric</th>
                <th>Average</th>
                <th>Min</th>
                <th>Max</th>
                <th>Std Dev</th>
            </tr>
            <tr>
                <td>Requests Per Second</td>
                <td>${stats.summary.requests_per_second.average.toFixed(0)}</td>
                <td>${stats.summary.requests_per_second.min.toFixed(0)}</td>
                <td>${stats.summary.requests_per_second.max.toFixed(0)}</td>
                <td>${stats.summary.requests_per_second.stddev.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Latency (ms)</td>
                <td>${stats.summary.latency.average.toFixed(2)}</td>
                <td>${stats.summary.latency.min.toFixed(2)}</td>
                <td>${stats.summary.latency.max.toFixed(2)}</td>
                <td>${stats.summary.latency.stddev.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Throughput</td>
                <td>${stats.summary.throughput.average.toFixed(0)}</td>
                <td>${stats.summary.throughput.min.toFixed(0)}</td>
                <td>${stats.summary.throughput.max.toFixed(0)}</td>
                <td>${stats.summary.throughput.stddev.toFixed(2)}</td>
            </tr>
        </table>

        <h2>📋 Latency Percentiles</h2>
        <table>
            <tr>
                <th>Percentile</th>
                <th>Value (ms)</th>
                <th>Percentile</th>
                <th>Value (ms)</th>
            </tr>
            <tr>
                <td>p50</td>
                <td>${stats.summary.latency.percentiles.p50.toFixed(2)}</td>
                <td>p90</td>
                <td>${stats.summary.latency.percentiles.p90.toFixed(2)}</td>
            </tr>
            <tr>
                <td>p75</td>
                <td>${stats.summary.latency.percentiles.p75.toFixed(2)}</td>
                <td>p95</td>
                <td>${stats.summary.latency.percentiles.p95.toFixed(2)}</td>
            </tr>
            <tr>
                <td>p99</td>
                <td>${stats.summary.latency.percentiles.p99.toFixed(2)}</td>
                <td>p99.9</td>
                <td>${stats.summary.latency.percentiles.p99_9.toFixed(2)}</td>
            </tr>
        </table>
    </div>

    <script>
        const latencyHistogram = new Chart(
            document.getElementById('latencyHistogram'),
            {
                type: 'bar',
                data: {
                    labels: ${JSON.stringify(histogramData.map(item => item.range))},
                    datasets: [{
                        label: 'Number of Requests',
                        data: ${JSON.stringify(histogramData.map(item => item.count))},
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Number of Requests'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Latency Range (ms)'
                            }
                        }
                    }
                }
            }
        );

        const rpsData = ${JSON.stringify(stats.summary.requests_per_second.percentiles)};
        const rpsChart = new Chart(
            document.getElementById('rpsChart'),
            {
                type: 'line',
                data: {
                    labels: ['p1', 'p10', 'p25', 'p50', 'p75', 'p90', 'p95', 'p99'],
                    datasets: [{
                        label: 'RPS Distribution',
                        data: [
                            rpsData.p1,
                            rpsData.p10,
                            rpsData.p25,
                            rpsData.p50,
                            rpsData.p75,
                            rpsData.p90,
                            rpsData.p95,
                            rpsData.p99
                        ],
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            title: {
                                display: true,
                                text: 'Requests Per Second'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Percentiles'
                            }
                        }
                    }
                }
            }
        );

        ${resourceData ? `
        const resourceChart = new Chart(
            document.getElementById('resourceChart'),
            {
                type: 'line',
                data: {
                    labels: ${JSON.stringify(resourceData.time_series.map((_, i) => i))},
                    datasets: [
                        {
                            label: 'CPU Usage %',
                            data: ${JSON.stringify(resourceData.time_series.map(ts => ts.cpu_percent))},
                            borderColor: 'rgb(255, 99, 132)',
                            backgroundColor: 'rgba(255, 99, 132, 0.1)',
                            yAxisID: 'y',
                            tension: 0.4
                        },
                        {
                            label: 'Memory Usage MB',
                            data: ${JSON.stringify(resourceData.time_series.map(ts => ts.memory_mb))},
                            borderColor: 'rgb(54, 162, 235)',
                            backgroundColor: 'rgba(54, 162, 235, 0.1)',
                            yAxisID: 'y1',
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: {
                                display: true,
                                text: 'CPU Usage %'
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: {
                                display: true,
                                text: 'Memory Usage MB'
                            },
                            grid: {
                                drawOnChartArea: false,
                            },
                        }
                    }
                }
            }
        );
        ` : ''}
    </script>
</body>
</html>`;

        return html;
    }

    loadResourceMetrics() {
        const resourceMetrics = [];
        const resultsDir = path.join(__dirname, '..', '..', `all-${this.framework}-results`);

        console.log(`📊 Looking for resource metrics for ${this.framework}`);

        for (let i = 1; i <= this.totalRuns; i++) {
            const runDir = path.join(resultsDir, `run-${i}`);
            const resourceFile = path.join(runDir, `resource-metrics-${this.testType}.json`);

            if (fs.existsSync(resourceFile)) {
                try {
                    const content = fs.readFileSync(resourceFile, 'utf8');
                    const resourceData = JSON.parse(content);
                    resourceMetrics.push(resourceData);
                    console.log(`✅ Loaded resource metrics for ${this.framework} run ${i}`);
                } catch (error) {
                    console.log(`❌ Error loading resource metrics for run ${i}: ${error.message}`);
                }
            } else {
                console.log(`⚠️ No resource metrics found for run ${i}: ${resourceFile}`);
            }
        }

        return resourceMetrics;
    }

    aggregateResourceMetrics(resourceMetrics) {
        if (resourceMetrics.length === 0) {
            console.log('❌ No resource metrics to aggregate');
            return null;
        }

        // Находим максимальную длину time series среди всех прогонов
        const maxLength = Math.max(...resourceMetrics.map(metric =>
            metric.time_series ? metric.time_series.length : 0
        ));

        // Создаем агрегированные временные точки
        const aggregatedTimeSeries = [];

        for (let i = 0; i < maxLength; i++) {
            const cpuValues = [];
            const memoryValues = [];
            let validPoints = 0;

            // Собираем значения для текущего timestamp из всех прогонов
            resourceMetrics.forEach(metric => {
                if (metric.time_series && metric.time_series[i]) {
                    const point = metric.time_series[i];
                    if (point.cpu_percent !== undefined && point.memory_mb !== undefined) {
                        cpuValues.push(point.cpu_percent);
                        memoryValues.push(point.memory_mb);
                        validPoints++;
                    }
                }
            });

            // Если есть данные для этого timestamp, вычисляем средние
            if (validPoints > 0) {
                aggregatedTimeSeries.push({
                    timestamp: i, // Нормализованный timestamp
                    cpu_percent: this.calculateAverage(cpuValues),
                    memory_mb: this.calculateAverage(memoryValues),
                    runs_contributing: validPoints,
                    min_cpu: Math.min(...cpuValues),
                    max_cpu: Math.max(...cpuValues),
                    min_memory: Math.min(...memoryValues),
                    max_memory: Math.max(...memoryValues)
                });
            }
        }

        // Агрегируем общую статистику по CPU и Memory
        const allCpuData = [];
        const allMemoryData = [];

        resourceMetrics.forEach(metric => {
            if (metric.resource_usage) {
                allCpuData.push(metric.resource_usage.cpu);
                allMemoryData.push(metric.resource_usage.memory);
            }
        });

        return {
            cpu: this.calculateResourceStats(allCpuData),
            memory: this.calculateResourceStats(allMemoryData),
            time_series: aggregatedTimeSeries,
            runs_aggregated: resourceMetrics.length,
            aggregation_info: {
                total_time_points: aggregatedTimeSeries.length,
                max_original_length: maxLength,
                aggregation_method: "average_across_runs"
            }
        };
    }

    calculateResourceStats(metricsArray) {
        const averages = metricsArray.map(m => m?.average).filter(v => !isNaN(v));
        const mins = metricsArray.map(m => m?.min).filter(v => !isNaN(v));
        const maxs = metricsArray.map(m => m?.max).filter(v => !isNaN(v));
        const medians = metricsArray.map(m => m?.median).filter(v => !isNaN(v));

        if (averages.length === 0) return null;

        return {
            average: this.calculateAverage(averages),
            min: Math.min(...mins),
            max: Math.max(...maxs),
            median: this.calculateAverage(medians),
            stddev: this.calculateStdDev(averages)
        };
    }

    loadResults() {
        const resultsDir = path.join(__dirname, '..', '..', `all-${this.framework}-results`);

        console.log(`📁 Looking for ${this.framework} results in: ${resultsDir}`);

        for (let i = 1; i <= this.totalRuns; i++) {
            const runDir = path.join(resultsDir, `run-${i}`);
            const resultFile = path.join(runDir, `${this.resultFileName}.json`);

            if (fs.existsSync(resultFile)) {
                try {
                    const content = fs.readFileSync(resultFile, 'utf8');
                    const autocannonResult = JSON.parse(content);

                    this.rawResults.push({
                        run: i,
                        ...autocannonResult
                    });

                    const processed = {
                        run: i,
                        requests_per_second: autocannonResult.requests.average,
                        total_requests: autocannonResult.requests.total,

                        latency_percentiles: {
                            average: autocannonResult.latency.average,
                            p1: autocannonResult.latency.p1,
                            p2_5: autocannonResult.latency.p2_5,
                            p10: autocannonResult.latency.p10,
                            p25: autocannonResult.latency.p25,
                            p50: autocannonResult.latency.p50,
                            p75: autocannonResult.latency.p75,
                            p90: autocannonResult.latency.p90,
                            p95: autocannonResult.latency.p97_5,
                            p99: autocannonResult.latency.p99,
                            p99_9: autocannonResult.latency.p99_9,
                            p99_99: autocannonResult.latency.p99_99,
                            min: autocannonResult.latency.min,
                            max: autocannonResult.latency.max,
                            stddev: autocannonResult.latency.stddev
                        },

                        throughput: {
                            average: autocannonResult.throughput.average,
                            min: autocannonResult.throughput.min,
                            max: autocannonResult.throughput.max,
                            total: autocannonResult.throughput.total,
                            stddev: autocannonResult.throughput.stddev
                        },

                        errors: autocannonResult.errors,
                        timeouts: autocannonResult.timeouts,

                        duration: autocannonResult.duration,
                        start: autocannonResult.start,
                        finish: autocannonResult.finish
                    };

                    this.processedResults.push(processed);
                    console.log(`✅ Loaded ${this.framework} run ${i}: ${processed.requests_per_second} req/sec`);

                } catch (error) {
                    console.log(`❌ Error loading ${this.framework} run ${i}: ${error.message}`);
                }
            } else {
                console.log(`❌ ${this.framework} result file not found: ${resultFile}`);
            }
        }
    }

    generateFinalReport() {
        if (this.rawResults.length === 0) {
            console.log('❌ No results to aggregate');
            return;
        }

        const rpsValues = this.processedResults.map(r => r.requests_per_second);

        const stats = {
            total_runs: this.totalRuns,

            summary: {
                requests_per_second: {
                    average: this.calculateAverage(rpsValues),
                    min: Math.min(...rpsValues),
                    max: Math.max(...rpsValues),
                    stddev: this.calculateStdDev(rpsValues),
                    percentiles: this.calculatePercentiles(rpsValues)
                },

                latency: {
                    average: this.calculateAverage(this.processedResults.map(r => r.latency_percentiles.average)),
                    min: Math.min(...this.processedResults.map(r => r.latency_percentiles.min)),
                    max: Math.max(...this.processedResults.map(r => r.latency_percentiles.max)),
                    stddev: this.calculateStdDev(this.processedResults.map(r => r.latency_percentiles.average)),
                    percentiles: {
                        p1: this.calculateAverage(this.processedResults.map(r => r.latency_percentiles.p1)),
                        p2_5: this.calculateAverage(this.processedResults.map(r => r.latency_percentiles.p2_5)),
                        p10: this.calculateAverage(this.processedResults.map(r => r.latency_percentiles.p10)),
                        p25: this.calculateAverage(this.processedResults.map(r => r.latency_percentiles.p25)),
                        p50: this.calculateAverage(this.processedResults.map(r => r.latency_percentiles.p50)),
                        p75: this.calculateAverage(this.processedResults.map(r => r.latency_percentiles.p75)),
                        p90: this.calculateAverage(this.processedResults.map(r => r.latency_percentiles.p90)),
                        p95: this.calculateAverage(this.processedResults.map(r => r.latency_percentiles.p95)),
                        p99: this.calculateAverage(this.processedResults.map(r => r.latency_percentiles.p99)),
                        p99_9: this.calculateAverage(this.processedResults.map(r => r.latency_percentiles.p99_9)),
                        p99_99: this.calculateAverage(this.processedResults.map(r => r.latency_percentiles.p99_99))
                    }
                },

                throughput: {
                    average: this.calculateAverage(this.processedResults.map(r => r.throughput.average)),
                    min: Math.min(...this.processedResults.map(r => r.throughput.average)),
                    max: Math.max(...this.processedResults.map(r => r.throughput.average)),
                    stddev: this.calculateStdDev(this.processedResults.map(r => r.throughput.average)),
                    percentiles: this.calculatePercentiles(this.processedResults.map(r => r.throughput.average))
                },

                errors_summary: {
                    total_errors: this.processedResults.reduce((sum, r) => sum + r.errors, 0),
                    total_timeouts: this.processedResults.reduce((sum, r) => sum + r.timeouts, 0),
                    error_rate: (this.processedResults.reduce((sum, r) => sum + r.errors, 0) /
                        this.processedResults.reduce((sum, r) => sum + r.total_requests, 0) * 100).toFixed(4) + '%'
                }
            }
        };

        const histogramData = this.createHistogramFromPercentiles(stats.summary.latency);

        const resourceMetrics = this.loadResourceMetrics();
        const aggregatedResourceData = this.aggregateResourceMetrics(resourceMetrics);

        if (aggregatedResourceData) {
            stats.summary.resource_usage = aggregatedResourceData;
        }

        const finalDir = path.join(__dirname, '..', '..', 'final-results', this.framework);
        fs.mkdirSync(finalDir, { recursive: true });

        fs.writeFileSync(
            path.join(finalDir, `complete-stats-${this.resultFileName}.json`),
            JSON.stringify(stats, null, 2)
        );

        fs.writeFileSync(
            path.join(finalDir, `raw-autocannon-data-${this.resultFileName}.json`),
            JSON.stringify(this.rawResults, null, 2)
        );

        const htmlReport = this.generateHTMLReport(stats, histogramData, aggregatedResourceData);
        fs.writeFileSync(
            path.join(finalDir, `performance-report-${this.resultFileName}.html`),
            htmlReport
        );

        console.log(`💾 Saved complete stats to: ${path.join(finalDir, `complete-stats-${this.resultFileName}.json`)}`);
        console.log(`💾 Saved raw data to: ${path.join(finalDir, `raw-autocannon-data-${this.resultFileName}.json`)}`);
        console.log(`💾 Saved HTML report to: ${path.join(finalDir, `performance-report-${this.resultFileName}.html`)}`);
    }

    calculateAverage(arr) {
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    }

    calculateStdDev(arr) {
        const avg = this.calculateAverage(arr);
        const squareDiffs = arr.map(value => Math.pow(value - avg, 2));
        return Math.sqrt(this.calculateAverage(squareDiffs));
    }

    calculatePercentiles(arr) {
        const sorted = [...arr].sort((a, b) => a - b);
        return {
            p1: sorted[Math.floor(sorted.length * 0.01)],
            p2_5: sorted[Math.floor(sorted.length * 0.025)],
            p10: sorted[Math.floor(sorted.length * 0.10)],
            p25: sorted[Math.floor(sorted.length * 0.25)],
            p50: sorted[Math.floor(sorted.length * 0.50)],
            p75: sorted[Math.floor(sorted.length * 0.75)],
            p90: sorted[Math.floor(sorted.length * 0.90)],
            p95: sorted[Math.floor(sorted.length * 0.95)],
            p99: sorted[Math.floor(sorted.length * 0.99)],
            p99_9: sorted[Math.floor(sorted.length * 0.999)],
            p99_99: sorted[Math.floor(sorted.length * 0.9999)]
        };
    }
}

const framework = process.argv[2];
const totalRuns = parseInt(process.argv[3]);
const resultFileName = process.argv[4] || 'results';
const testType = process.argv[5];
const aggregator = new ResultsAggregator(framework, totalRuns, resultFileName, testType);
aggregator.loadResults();
aggregator.generateFinalReport();