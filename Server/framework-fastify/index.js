require('module-alias/register');
const config = require('./config');
const FastifyServer = require('./fastifyServer');
const {setupTestDatabase} = require("../common/database-setup");

const launchServer = async () => {
    require('dotenv').config();
    if (process.env.DATABASE_NAME === "anekdot_test") {
        await setupTestDatabase();
        process.env.JWT_SECRET="your_super_secret_key_here_min_32_chars"
    }
    let fastifyServer = new FastifyServer(config.URL_PORT, config.OPENAPI_YAML);
    await fastifyServer.launch();
};

launchServer().catch(e => console.error(e));