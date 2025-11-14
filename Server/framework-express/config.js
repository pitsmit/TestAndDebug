const path = require('path');

const config = {
  URL_PORT: 3000,
  URL_PATH: 'http://localhost',
  BASE_VERSION: '',
  OPENAPI_YAML: path.join('api', 'openapi.yaml'),
};

module.exports = config;
