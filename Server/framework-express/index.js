require('module-alias/register');
const config = require('./config');
const ExpressServer = require('./expressServer');
const path = require('path');
const commonPath = path.join(__dirname, '..', 'common');
const {setupTestDatabase} = require(commonPath + '/database-setup');

const launchServer = async () => {
  require('dotenv').config();
  if (process.env.DATABASE_NAME === "anekdot_test") {
    await setupTestDatabase();
    process.env.JWT_SECRET="your_super_secret_key_here_min_32_chars"
  }
  let expressServer = new ExpressServer(config.URL_PORT, config.OPENAPI_YAML);
  expressServer.launch();
};

launchServer().catch(e => console.error(e));
