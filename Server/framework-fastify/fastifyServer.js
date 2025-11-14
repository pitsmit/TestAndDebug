const fs = require('fs');
const jsYaml = require('js-yaml');
const fastify = require('fastify');
const path = require('path');
const openapiGlue = require('fastify-openapi-glue');

class FastifyServer {
    constructor(port, openApiYaml) {
        this.port = port;
        this.schema = this.loadAndCleanOpenApi(openApiYaml);
        this.app = fastify();
    }

    loadAndCleanOpenApi(openApiYaml) {
        const schema = jsYaml.load(fs.readFileSync(openApiYaml, 'utf8'));
        this.removeExamples(schema);
        return schema;
    }

    removeExamples(obj) {
        if (typeof obj !== 'object' || obj === null) return;

        for (const key in obj) {
            if (key === 'example' || key === 'examples') {
                delete obj[key];
            } else {
                this.removeExamples(obj[key]);
            }
        }
    }

    async setupMiddleware() {
        this.app.get('/api/health', async (_request, _reply) => {
            return {
                status: 'OK',
                timestamp: new Date().toISOString(),
                service: 'anekdot-server'
            };
        });

        await this.app.register(require('@fastify/cors'));

        await this.app.register(require('@fastify/cookie'));

        const serviceHandlers = this.loadServiceHandlers();

        await this.app.register(openapiGlue, {
            specification: this.schema,
            serviceHandlers: serviceHandlers,
            noAdditional: true,
        });

        await this.app.register(require('@fastify/swagger'), {
            openapi: this.schema
        });

        await this.app.register(require('@fastify/swagger-ui'), {
            routePrefix: '/api-docs',
            uiConfig: {
                docExpansion: 'full',
                deepLinking: false
            }
        });
    }

    loadServiceHandlers() {
        const serviceHandlers = {};
        const controllersPath = path.join(__dirname, 'controllers');

        if (!fs.existsSync(controllersPath)) {
            console.error(`Controllers path not found: ${controllersPath}`);
            return serviceHandlers;
        }

        const files = fs.readdirSync(controllersPath);

        for (const file of files) {
            const controller = require(path.join(controllersPath, file));

            for (const [key, handler] of Object.entries(controller)) {
                serviceHandlers[key] = handler;
            }
        }

        return serviceHandlers;
    }

    async launch() {
        try {
            await this.setupMiddleware();
            await this.app.listen({ port: this.port });
            console.log(`Listening on port ${this.port}`);
        } catch (err) {
            console.error('Server error:', err);
            process.exit(1);
        }
    }
}

module.exports = FastifyServer;