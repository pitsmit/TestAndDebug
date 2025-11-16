// Server/benchmark/serialization-test/resource-test.js
const fs = require('fs');
const path = require('path');
const ResourceMonitor = require('../scripts/resource-monitor');

function parseDockerStats(logContent, framework, runNumber) {
    const lines = logContent.split('\n').filter(line => line.trim());

    const dataLines = lines.slice(1).filter(line =>
        line.includes('%') &&
        (line.includes('MiB') || line.includes('GiB'))
    );

    const monitor = new ResourceMonitor(framework, 'combined', runNumber);

    dataLines.forEach(line => {
        try {
            const parts = line.split(/\s+/).filter(p => p.trim());

            if (parts.length >= 4) {
                const cpuPercent = parseFloat(parts[0].replace('%', '')) || 0;

                const memoryPart = parts[1].split('/')[0];
                let memoryMB = 0;

                if (memoryPart.includes('GiB')) {
                    memoryMB = parseFloat(memoryPart.replace('GiB', '')) * 1024;
                } else if (memoryPart.includes('MiB')) {
                    memoryMB = parseFloat(memoryPart.replace('MiB', ''));
                }

                monitor.addMetrics({
                    cpu_percent: cpuPercent,
                    memory_mb: Math.round(memoryMB),
                    network_io: parts[2] || '',
                    disk_io: parts[3] || ''
                });
            }
        } catch (error) {
            console.log('Error parsing stats line:', error.message);
        }
    });

    return monitor.saveMetrics();
}

async function processResourceStats() {
    const framework = process.argv[2];
    const runNumber = process.argv[3];
    const logFile = process.argv[4];

    console.log(`📊 Processing resources for ${framework} run ${runNumber}`);

    if (!fs.existsSync(logFile)) {
        console.log('❌ Stats log file not found:', logFile);
        return;
    }

    const logContent = fs.readFileSync(logFile, 'utf8');
    const result = parseDockerStats(logContent, framework, runNumber);

    if (result) {
        console.log('✅ Resource metrics processed successfully');
    } else {
        console.log('❌ Failed to process resource metrics');
    }
}

// Запуск из командной строки
if (require.main === module) {
    processResourceStats().catch(console.error);
}

module.exports = { processResourceStats, parseDockerStats };