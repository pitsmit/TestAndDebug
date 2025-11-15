const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class SingleTestRunner {
    constructor(framework) {
        this.framework = framework;
        this.runNumber = process.env.RUN_NUMBER || 1;

        // ✅ Правильный путь внутри контейнера
        this.resultsDir = `/app/results/${this.framework}/run-${this.runNumber}`;

        // Создаем директорию для результатов
        fs.mkdirSync(this.resultsDir, { recursive: true });

        console.log(`🎯 SingleTestRunner for ${this.framework}, run ${this.runNumber}`);
    }

    async run() {
        console.log(`\n🚀 Starting single test for ${this.framework} (Run ${this.runNumber})`);

        try {
            const testFile = `test-${this.framework}.js`;
            console.log(`📄 Using test file: ${testFile}`);

            // Проверяем существование тестового файла
            if (!fs.existsSync(testFile)) {
                throw new Error(`Test file ${testFile} not found in ${process.cwd()}! Available files: ${fs.readdirSync('.')}`);
            }

            // Запускаем тест
            const output = execSync(`node ${testFile}`, {
                encoding: 'utf8',
                stdio: 'pipe',
                timeout: 60000 // 60 секунд таймаут
            });

            console.log(`📋 Test output received`);

            // Парсим результат
            const match = output.match(/✅.*?(\d+\.?\d*) req\/sec/);
            const rps = match ? parseFloat(match[1]) : 0;

            const result = {
                run: parseInt(this.runNumber),
                framework: this.framework,
                requestsPerSecond: rps,
                timestamp: new Date().toISOString(),
                status: 'success',
                rawOutput: output.substring(0, 1000) // Сохраняем часть вывода для отладки
            };

            this.saveResult(result);
            console.log(`✅ Run ${this.runNumber} completed: ${rps} req/sec`);

            return result;

        } catch (error) {
            console.error(`❌ Run ${this.runNumber} failed:`, error.message);

            const result = {
                run: parseInt(this.runNumber),
                framework: this.framework,
                requestsPerSecond: 0,
                timestamp: new Date().toISOString(),
                status: 'failed',
                error: error.message
            };

            this.saveResult(result);
            return result;
        }
    }

    saveResult(result) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        // Сохраняем в JSON
        const jsonFile = path.join(this.resultsDir, `result.json`);
        fs.writeFileSync(jsonFile, JSON.stringify(result, null, 2));
        console.log(`💾 JSON result saved to: ${jsonFile}`);

        // Сохраняем в CSV
        const csvFile = path.join(this.resultsDir, 'results.csv');
        const csvRow = [
            result.run,
            result.framework,
            result.requestsPerSecond,
            result.timestamp,
            result.status
        ].join(',');

        // Добавляем заголовок если файл новый
        if (!fs.existsSync(csvFile)) {
            const header = 'Run,Framework,RequestsPerSecond,Timestamp,Status\n';
            fs.writeFileSync(csvFile, header);
        }

        fs.appendFileSync(csvFile, csvRow + '\n');
        console.log(`💾 CSV result appended to: ${csvFile}`);
    }
}

// Запуск одиночного теста
const framework = process.argv[2];
if (!framework) {
    console.error('❌ Please specify framework: node single-test.js [express|fastify]');
    process.exit(1);
}

const runner = new SingleTestRunner(framework);
runner.run().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
});