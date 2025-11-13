const http = require('http');
const fs = require('fs');
const swaggerUI = require('swagger-ui-express');
const jsYaml = require('js-yaml');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const OpenApiValidator = require('express-openapi-validator');

class ExpressServer {
  constructor(port, openApiYaml) {
    this.port = port;
    this.app = express();
    this.openApiPath = openApiYaml;
    this.schema = jsYaml.safeLoad(fs.readFileSync(openApiYaml), null);

    this.setupMiddleware();
  }

  setupMiddleware() {
    this.app.get('/api/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'anekdot-server'
      });
    });

    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(cookieParser());

    this.app.use('/api-docs', [
      swaggerUI.serve,
      swaggerUI.setup(this.schema)
    ]);

    this.app.use(
        OpenApiValidator.middleware({
          apiSpec: this.openApiPath,
          operationHandlers: __dirname
        }),
    );
  }

  launch() {
    this.app.use(this.errorHandler);
    http.createServer(this.app).listen(this.port);
    console.log(`Listening on port ${this.port}`);
  }

  /**
   * @type {import('express').ErrorRequestHandler}
   */
  errorHandler = (err, req, res, _next) => {
    res.status(err.status || 500).json({
      message: err.message || err,
      errors: err.errors || '',
    });
  };
}

module.exports = ExpressServer;