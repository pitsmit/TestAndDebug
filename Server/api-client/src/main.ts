import { ApiClient } from "./api-client";
import { VisitorExperience } from "./visitor";

async function bootstrap(): Promise<void> {
    try {
        const client = new ApiClient();
        const visitorExperience = new VisitorExperience(client);
        await visitorExperience.main();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

process.on('SIGINT', () => {
    console.log('\n👋 До свидания!');
    process.exit(0);
});

bootstrap().catch(error => {
    console.error('💥 Bootstrap failed:', error);
    process.exit(1);
});