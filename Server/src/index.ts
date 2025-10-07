import 'dotenv/config';
import { ApiServer } from './api-server';
import { ConsoleApp } from './console-app';

const isApiMode = process.env.APP_MODE === 'api' || process.argv.includes('--api');

async function bootstrap(): Promise<void> {
    try {
        console.log('🚀 Starting application...');
        console.log(`📋 Mode: ${isApiMode ? 'API' : 'Console'}`);

        if (isApiMode) {
            console.log('🔧 Initializing API Server...');
            const apiServer = new ApiServer(3000);
            await apiServer.start();
            console.log('✅ API Server started successfully');
        } else {
            console.log('🔧 Initializing Console App...');
            const consoleApp = new ConsoleApp();
            await consoleApp.start();
            console.log('✅ Console App started successfully');
        }
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