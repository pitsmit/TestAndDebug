require('module-alias/register');
const config = require('./config');
const ExpressServer = require('./expressServer');
const {setupTestDatabase} = require("./database-setup");

const launchServer = async () => {
  try {
    if (process.env.DATABASE_NAME === "anekdot_test") {
      await setupTestDatabase();
    }
    this.expressServer = new ExpressServer(config.URL_PORT, config.OPENAPI_YAML);
    this.expressServer.launch();
  } catch (error) {
    await this.close();
  }
};

launchServer().catch(e => console.error(e));
