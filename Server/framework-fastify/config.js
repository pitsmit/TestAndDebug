const path = require('path');

const config = {
  URL_PORT: 3001,
  URL_PATH: 'http://localhost',
  BASE_VERSION: '',
  OPENAPI_YAML: path.join(__dirname, '..', 'common', 'api', 'openapi.yaml'),
};

module.exports = config;