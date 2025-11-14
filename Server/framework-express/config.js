const path = require('path');

const commonPath = path.join(__dirname, '..', 'common');

const config = {
  URL_PORT: 3000,
  URL_PATH: 'http://localhost',
  BASE_VERSION: '',
  OPENAPI_YAML: path.join('.', commonPath, 'api', 'openapi.yaml'),
};

module.exports = config;
