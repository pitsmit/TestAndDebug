const fs = require('fs');
const path = require('path');

class ResultsAggregator {
    constructor(framework, totalRuns, resultFileName) {
        this.framework = framework;
        this.totalRuns = totalRuns;
        this.resultFileName = resultFileName.replace('.json', '');
        this.rawResults = []; // Сохраняем сырые данные autocannon
        this.processedResults = []; // И обработанные метрики
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

                    // ✅ Сохраняем ВСЕ сырые данные от autocannon
                    this.rawResults.push({
                        run: i,
                        timestamp: new Date().toISOString(),
                        ...autocannonResult
                    });

                    // ✅ Также создаем обработанную версию для удобства
                    const processed = {
                        run: i,
                        timestamp: new Date().toISOString(),
                        requests_per_second: autocannonResult.requests.average,
                        total_requests: autocannonResult.requests.total,

                        // 📊 ВСЕ перцентили из autocannon
                        latency_percentiles: {
                            average: autocannonResult.latency.average,
                            p50: autocannonResult.latency.p50,
                            p75: autocannonResult.latency.p75,
                            p90: autocannonResult.latency.p90,
                            p95: autocannonResult.latency.p97_5, // Ближайший к p95
                            p99: autocannonResult.latency.p99,
                            p99_9: autocannonResult.latency.p99_9,
                            p99_99: autocannonResult.latency.p99_99,
                            min: autocannonResult.latency.min,
                            max: autocannonResult.latency.max,
                            stddev: autocannonResult.latency.stddev
                        },

                        // 📈 Все метрики throughput
                        throughput: {
                            average: autocannonResult.throughput.average,
                            min: autocannonResult.throughput.min,
                            max: autocannonResult.throughput.max,
                            total: autocannonResult.throughput.total,
                            stddev: autocannonResult.throughput.stddev
                        },

                        // ❌ Ошибки и таймауты
                        errors: autocannonResult.errors,
                        timeouts: autocannonResult.timeouts,

                        // ⏰ Тайминги
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

        console.log(`📊 Loaded ${this.rawResults.length} ${this.framework} results out of ${this.totalRuns} runs`);
    }

    generateFinalReport() {
        if (this.rawResults.length === 0) {
            console.log('❌ No results to aggregate');
            return;
        }

        // ✅ Агрегируем статистику используя данные autocannon
        const rpsValues = this.processedResults.map(r => r.requests_per_second);
        const latencyP99Values = this.processedResults.map(r => r.latency_percentiles.p99);

        const stats = {
            // 📋 Мета информация
            framework: this.framework,
            test_type: this.resultFileName,
            total_runs: this.totalRuns,
            successful_runs: this.rawResults.length,
            aggregation_timestamp: new Date().toISOString(),

            // 📊 СВОДНАЯ СТАТИСТИКА (агрегированная по всем прогонам)
            summary: {
                // RPS статистика
                requests_per_second: {
                    average: this.calculateAverage(rpsValues),
                    min: Math.min(...rpsValues),
                    max: Math.max(...rpsValues),
                    stddev: this.calculateStdDev(rpsValues),
                    // ✅ Все перцентили из агрегированных данных
                    percentiles: this.calculatePercentiles(rpsValues)
                },

                // Latency статистика (P99)
                latency_p99: {
                    average: this.calculateAverage(latencyP99Values),
                    min: Math.min(...latencyP99Values),
                    max: Math.max(...latencyP99Values),
                    stddev: this.calculateStdDev(latencyP99Values)
                },

                // Общая статистика ошибок
                errors_summary: {
                    total_errors: this.processedResults.reduce((sum, r) => sum + r.errors, 0),
                    total_timeouts: this.processedResults.reduce((sum, r) => sum + r.timeouts, 0),
                    error_rate: (this.processedResults.reduce((sum, r) => sum + r.errors, 0) /
                        this.processedResults.reduce((sum, r) => sum + r.total_requests, 0) * 100).toFixed(4) + '%'
                }
            },

            // 📈 ДЕТАЛЬНЫЕ ДАННЫЕ ДЛЯ ГРАФИКОВ И АНАЛИЗА
            chart_data: {
                // RPS по прогонам
                rps_over_time: this.processedResults.map(r => ({
                    run: r.run,
                    rps: r.requests_per_second,
                    timestamp: r.timestamp
                })),

                // Все перцентили задержек по прогонам
                latency_distribution: this.processedResults.map(r => ({
                    run: r.run,
                    average: r.latency_percentiles.average,
                    p50: r.latency_percentiles.p50,
                    p75: r.latency_percentiles.p75,
                    p90: r.latency_percentiles.p90,
                    p95: r.latency_percentiles.p95,
                    p99: r.latency_percentiles.p99,
                    p99_9: r.latency_percentiles.p99_9,
                    p99_99: r.latency_percentiles.p99_99,
                    min: r.latency_percentiles.min,
                    max: r.latency_percentiles.max
                })),

                // Throughput по прогонам
                throughput_over_time: this.processedResults.map(r => ({
                    run: r.run,
                    throughput: r.throughput.average,
                    timestamp: r.timestamp
                }))
            },

            // 🗂️ ПОЛНЫЕ ДАННЫЕ КАЖДОГО ПРОГОНА (ВСЕ поля autocannon)
            individual_runs: this.rawResults,

            // 📄 ОБРАБОТАННЫЕ ДАННЫЕ ДЛЯ УДОБСТВА
            processed_runs: this.processedResults
        };

        console.log('\n📊 FINAL AGGREGATED REPORT');
        console.log('=' .repeat(50));
        console.log(`Framework: ${stats.framework}`);
        console.log(`Test Type: ${stats.test_type}`);
        console.log(`Runs: ${stats.successful_runs}/${stats.total_runs} successful`);
        console.log(`Average RPS: ${stats.summary.requests_per_second.average.toFixed(0)}`);
        console.log(`RPS Range: ${stats.summary.requests_per_second.min.toFixed(0)} - ${stats.summary.requests_per_second.max.toFixed(0)}`);
        console.log(`P99 Latency: ${stats.summary.latency_p99.average.toFixed(1)}ms`);
        console.log(`Total Errors: ${stats.summary.errors_summary.total_errors}`);
        console.log(`Error Rate: ${stats.summary.errors_summary.error_rate}`);

        const finalDir = path.join(__dirname, '..', '..', 'final-results', this.framework);
        fs.mkdirSync(finalDir, { recursive: true });

        // ✅ Сохраняем ПОЛНУЮ статистику
        fs.writeFileSync(
            path.join(finalDir, `complete-stats-${this.resultFileName}.json`),
            JSON.stringify(stats, null, 2)
        );

        // ✅ Сохраняем только сырые данные autocannon
        fs.writeFileSync(
            path.join(finalDir, `raw-autocannon-data-${this.resultFileName}.json`),
            JSON.stringify(this.rawResults, null, 2)
        );

        // ✅ Сохраняем данные для графиков (отдельно)
        fs.writeFileSync(
            path.join(finalDir, `chart-data-${this.resultFileName}.json`),
            JSON.stringify(stats.chart_data, null, 2)
        );

        console.log(`💾 Saved complete stats to: ${path.join(finalDir, `complete-stats-${this.resultFileName}.json`)}`);
        console.log(`💾 Saved raw data to: ${path.join(finalDir, `raw-autocannon-data-${this.resultFileName}.json`)}`);
        console.log(`💾 Saved chart data to: ${path.join(finalDir, `chart-data-${this.resultFileName}.json`)}`);
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
            p50: sorted[Math.floor(sorted.length * 0.50)],
            p75: sorted[Math.floor(sorted.length * 0.75)],
            p90: sorted[Math.floor(sorted.length * 0.90)],
            p95: sorted[Math.floor(sorted.length * 0.95)],
            p99: sorted[Math.floor(sorted.length * 0.99)]
        };
    }
}

const framework = process.argv[2];
const totalRuns = parseInt(process.argv[3]);
const resultFileName = process.argv[4] || 'results';
const aggregator = new ResultsAggregator(framework, totalRuns, resultFileName);
aggregator.loadResults();
aggregator.generateFinalReport();