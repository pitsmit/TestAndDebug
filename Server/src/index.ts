import 'dotenv/config';
import { ConsoleApp } from '@TechUI/console-app';

async function bootstrap(): Promise<void> {
    try {
        console.log('🔧 Initializing Console App...');
        const consoleApp = new ConsoleApp();
        await consoleApp.start();
        console.log('✅ Console App started successfully');
    } catch (error) {
        console.error('❌ Failed to start application:', error);
        process.exit(1);
    }
}

process.on('SIGINT', () => {
    console.log('Received SIGINT. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Shutting down gracefully...');
    process.exit(0);
});

bootstrap()
    .catch(error => {
        console.error('💥 Bootstrap failed:', error);
        process.exit(1);
    });