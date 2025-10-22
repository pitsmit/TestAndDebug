require('module-alias/register');
const config = require('./config');
const ExpressServer = require('./expressServer');
const {setupTestDatabase} = require("./database-setup");

const launchServer = async () => {
  try {
    if (process.env.DATABASE_NAME === "anekdot_test") {
      await setupTestDatabase();
      process.env.JWT_SECRET="your_super_secret_key_here_min_32_chars"
    }
    this.expressServer = new ExpressServer(config.URL_PORT, config.OPENAPI_YAML);
    this.expressServer.launch();
  } catch (error) {
    await this.close();
  }
};

launchServer().catch(e => console.error(e));
