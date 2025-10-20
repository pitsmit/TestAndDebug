"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_client_1 = require("./api-client");
const visitor_1 = require("./visitor");
async function bootstrap() {
    try {
        const client = new api_client_1.ApiClient();
        const visitorExperience = new visitor_1.VisitorExperience(client);
        await visitorExperience.main();
    }
    catch (error) {
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
