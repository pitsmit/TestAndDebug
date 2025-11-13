require('module-alias/register');
const config = require('../common/config');
const FastifyServer = require('./fastifyServer');
const {setupTestDatabase} = require("../common/database-setup");

const launchServer = async () => {
    let fastifyServer;

    try {
        require('dotenv').config();
        if (process.env.DATABASE_NAME === "anekdot_test") {
            await setupTestDatabase();
            process.env.JWT_SECRET="your_super_secret_key_here_min_32_chars"
        }
        fastifyServer = new FastifyServer(config.URL_PORT, config.OPENAPI_YAML);
        await fastifyServer.launch();
    } catch (error) {
        console.error('Server error:', error);
        if (fastifyServer) {
            await fastifyServer.close();
        }
        process.exit(1);
    }
};

launchServer().catch(e => {
    console.error('Launch error:', e);
    process.exit(1);
});