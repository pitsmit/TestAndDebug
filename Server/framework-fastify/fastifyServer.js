const fs = require('fs');
const path = require('path');
const jsYaml = require('js-yaml');
const fastify = require('fastify');
const config = require('../common/config');

class FastifyServer {
    constructor(port, openApiYaml) {
        this.port = port;
        this.openApiPath = openApiYaml;

        this.app = fastify({
            logger: true
        });

        try {
            this.schema = jsYaml.safeLoad(fs.readFileSync(openApiYaml));
        } catch (e) {
            console.error('failed to start Fastify Server', e.message);
        }
    }

    async setupMiddleware() {
        // Подключаем Express к Fastify для использования express-openapi-validator
        await this.app.register(require('@fastify/express'));

        // Health check
        this.app.get('/api/health', async (req, res) => {
            return {
                status: 'OK',
                timestamp: new Date().toISOString(),
                service: 'anekdot-server-fastify'
            };
        });

        // CORS
        await this.app.register(require('@fastify/cors'));

        // Cookie parser
        await this.app.register(require('@fastify/cookie'));

        // Статические роуты
        this.app.get('/hello', async (req, res) => {
            return `Hello World. path: ${this.openApiPath}`;
        });

        this.app.get('/openapi', async (req, res) => {
            const openApiPath = path.join(__dirname, '..', 'common', 'api', 'openapi.yaml');
            return res.type('text/yaml').send(fs.readFileSync(openApiPath, 'utf8'));
        });

        // Swagger документация - НАСТРОИМ ПРАВИЛЬНО ДЛЯ ПАРАМЕТРОВ
        await this.app.register(require('@fastify/swagger'), {
            openapi: this.schema, // Используем полную схему из OpenAPI
            hideUntagged: false
        });

        await this.app.register(require('@fastify/swagger-ui'), {
            routePrefix: '/api-docs',
            uiConfig: {
                docExpansion: 'full',
                deepLinking: true,
                displayRequestDuration: true
            }
        });

        this.app.get('/login-redirect', async (req, res) => {
            return req.query;
        });

        this.app.get('/oauth2-redirect.html', async (req, res) => {
            return req.query;
        });

        // Устанавливаем express-openapi-validator middleware
        const OpenApiValidator = require('express-openapi-validator');
        const validatorMiddleware = OpenApiValidator.middleware({
            apiSpec: this.openApiPath,
            operationHandlers: path.join(__dirname, '..', 'common'),
            fileUploader: { dest: config.FILE_UPLOAD_PATH },
            validateRequests: true,
            validateResponses: false
        });

        this.app.use(validatorMiddleware);

        console.log('✅ OpenAPI validator middleware installed');
    }

    async launch() {
        try {
            await this.setupMiddleware();

            // Обработка ошибок
            this.app.setErrorHandler((err, req, res) => {
                console.error('Error:', err);

                // Обработка ошибок валидации OpenAPI
                if (err.status && err.errors) {
                    return res.status(err.status).send({
                        message: 'Validation failed',
                        errors: err.errors
                    });
                }

                res.status(err.statusCode || 500).send({
                    message: err.message || 'Internal Server Error'
                });
            });

            // Запуск сервера
            await this.app.listen({
                port: this.port,
                host: '0.0.0.0'
            });

            console.log(`✅ Fastify server listening on port ${this.port}`);
            console.log(`📚 Swagger UI: http://localhost:${this.port}/api-docs`);
            console.log(`❤️  Health check: http://localhost:${this.port}/api/health`);

        } catch (err) {
            console.error('Failed to start server:', err);
            throw err;
        }
    }

    async close() {
        await this.app.close();
        console.log(`Server on port ${this.port} shut down`);
    }
}

module.exports = FastifyServer;