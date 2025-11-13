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
            logger: {
                level: 'info'
            }
        });

        try {
            this.schema = jsYaml.safeLoad(fs.readFileSync(openApiYaml));
        } catch (e) {
            console.error('failed to load OpenAPI schema:', e.message);
        }
    }

    async setupMiddleware() {
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

        // Swagger документация
        await this.app.register(require('@fastify/swagger'), {
            openapi: {
                openapi: '3.1.1',
                info: {
                    title: 'Сайт с анекдотами Anekdotus',
                    description: 'API для управления анекдотами',
                    version: '1.0.0'
                },
                servers: [
                    {
                        url: `http://localhost:${this.port}`,
                        description: 'Development server'
                    }
                ]
            }
        });

        // Swagger UI
        await this.app.register(require('@fastify/swagger-ui'), {
            routePrefix: '/documentation',
            uiConfig: {
                docExpansion: 'full',
                deepLinking: true,
                displayRequestDuration: true,
                showExtensions: true
            },
            staticCSP: true
        });

        // Регистрируем основные роуты
        await this.setupRoutes();
    }

    async setupRoutes() {
        // Импортируем контроллеры
        const FeedController = require('../common/controllers/FeedController');
        const AuthController = require('../common/controllers/AuthController');
        const AnekdotController = require('../common/controllers/AnekdotController');
        const FavoriteController = require('../common/controllers/FavouritesController');

        console.log('Registering routes...');

        // Feed routes с описанием схем для Swagger
        this.app.get('/api/v1/feed', {
            schema: {
                description: 'Получение списка анекдотов',
                tags: ['Feed'],
                summary: 'Получить ленту анекдотов',
                querystring: {
                    type: 'object',
                    properties: {
                        page: { type: 'integer', default: 1 },
                        limit: { type: 'integer', default: 10 }
                    }
                },
                response: {
                    200: {
                        description: 'Успешный ответ с анекдотами',
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'number' },
                                text: { type: 'string' },
                                hasBadWords: { type: 'boolean' },
                                lastModifiedDate: { type: 'string' }
                            }
                        }
                    }
                }
            }
        }, FeedController.apiV1FeedGET);
        console.log('✅ GET /api/v1/feed');

        // Auth routes с описанием схем
        this.app.post('/api/v1/login', {
            schema: {
                description: 'Вход в аккаунт',
                tags: ['Auth'],
                summary: 'Аутентификация пользователя',
                body: {
                    type: 'object',
                    required: ['login', 'password'],
                    properties: {
                        login: { type: 'string', maxLength: 10 },
                        password: { type: 'string', maxLength: 10 }
                    }
                },
                response: {
                    200: {
                        description: 'Успешный вход',
                        type: 'object',
                        properties: {
                            user: {
                                type: 'object',
                                properties: {
                                    token: { type: 'string' },
                                    login: { type: 'string' },
                                    name: { type: 'string' },
                                    role: { type: 'integer' }
                                }
                            }
                        }
                    },
                    401: {
                        description: 'Неверный логин или пароль',
                        type: 'object',
                        properties: {
                            code: { type: 'integer' },
                            message: { type: 'string' }
                        }
                    }
                }
            }
        }, AuthController.apiV1LoginPOST);
        console.log('✅ POST /api/v1/login');

        this.app.post('/api/v1/register', {
            schema: {
                description: 'Регистрация пользователя',
                tags: ['Auth'],
                summary: 'Создание нового пользователя',
                body: {
                    type: 'object',
                    required: ['login', 'password', 'name', 'role'],
                    properties: {
                        login: { type: 'string', maxLength: 10 },
                        password: { type: 'string', maxLength: 10 },
                        name: { type: 'string', maxLength: 10 },
                        role: { type: 'integer', enum: [0, 1] }
                    }
                },
                response: {
                    201: {
                        description: 'Пользователь зарегистрирован',
                        type: 'object',
                        properties: {
                            user: {
                                type: 'object',
                                properties: {
                                    token: { type: 'string' },
                                    login: { type: 'string' },
                                    name: { type: 'string' },
                                    role: { type: 'integer' }
                                }
                            }
                        }
                    }
                }
            }
        }, AuthController.apiV1RegisterPOST);
        console.log('✅ POST /api/v1/register');

        // Anekdot routes с ИСПРАВЛЕННЫМИ схемами ответов
        if (AnekdotController.apiV1AnekdotsIdDELETE) {
            this.app.delete('/api/v1/anekdots/:id', {
                schema: {
                    description: 'Удаление анекдота по id',
                    tags: ['Anekdot'],
                    summary: 'Удалить анекдот',
                    params: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' }
                        }
                    },
                    response: {
                        204: {
                            type: 'null' // ИСПРАВЛЕНО: для 204 статуса
                        }
                    }
                }
            }, AnekdotController.apiV1AnekdotsIdDELETE);
            console.log('✅ DELETE /api/v1/anekdots/:id');
        }

        if (AnekdotController.apiV1AnekdotsIdPUT) {
            this.app.put('/api/v1/anekdots/:id', {
                schema: {
                    description: 'Редактирование анекдота по id',
                    tags: ['Anekdot'],
                    summary: 'Обновить анекдот',
                    params: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' }
                        }
                    },
                    body: {
                        type: 'object',
                        required: ['text'],
                        properties: {
                            text: { type: 'string' }
                        }
                    },
                    response: {
                        200: {
                            description: 'Анекдот обновлен',
                            type: 'object',
                            properties: {
                                id: { type: 'number' },
                                text: { type: 'string' },
                                hasBadWords: { type: 'boolean' },
                                lastModifiedDate: { type: 'string' }
                            }
                        }
                    }
                }
            }, AnekdotController.apiV1AnekdotsIdPUT);
            console.log('✅ PUT /api/v1/anekdots/:id');
        }

        if (AnekdotController.apiV1AnekdotsPOST) {
            this.app.post('/api/v1/anekdots', {
                schema: {
                    description: 'Загрузка нового анекдота',
                    tags: ['Anekdot'],
                    summary: 'Создать анекдот',
                    body: {
                        type: 'object',
                        required: ['text'],
                        properties: {
                            text: { type: 'string' }
                        }
                    },
                    response: {
                        201: {
                            description: 'Анекдот создан',
                            type: 'object',
                            properties: {
                                id: { type: 'number' },
                                text: { type: 'string' },
                                hasBadWords: { type: 'boolean' },
                                lastModifiedDate: { type: 'string' }
                            }
                        }
                    }
                }
            }, AnekdotController.apiV1AnekdotsPOST);
            console.log('✅ POST /api/v1/anekdots');
        }

        // Favorite routes с ИСПРАВЛЕННЫМИ схемами ответов
        if (FavoriteController.apiV1AnekdotsIdFavoritePOST) {
            this.app.post('/api/v1/anekdots/:id/favorite', {
                schema: {
                    description: 'Добавление анекдота в избранное',
                    tags: ['Favourites'],
                    summary: 'Добавить в избранное',
                    params: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' }
                        }
                    },
                    response: {
                        201: {
                            description: 'Анекдот добавлен в избранное',
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' }
                            }
                        }
                    }
                }
            }, FavoriteController.apiV1AnekdotsIdFavoritePOST);
            console.log('✅ POST /api/v1/anekdots/:id/favorite');
        }

        if (FavoriteController.apiV1AnekdotsIdFavoriteDELETE) {
            this.app.delete('/api/v1/anekdots/:id/favorite', {
                schema: {
                    description: 'Удаление анекдота из избранного',
                    tags: ['Favourites'],
                    summary: 'Удалить из избранного',
                    params: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' }
                        }
                    },
                    response: {
                        204: {
                            type: 'null' // ИСПРАВЛЕНО: для 204 статуса
                        }
                    }
                }
            }, FavoriteController.apiV1AnekdotsIdFavoriteDELETE);
            console.log('✅ DELETE /api/v1/anekdots/:id/favorite');
        }

        if (FavoriteController.apiV1FavoritesGET) {
            this.app.get('/api/v1/favorites', {
                schema: {
                    description: 'Получение списка избранных анекдотов',
                    tags: ['Favourites'],
                    summary: 'Получить избранное',
                    querystring: {
                        type: 'object',
                        properties: {
                            page: { type: 'integer', default: 1 },
                            limit: { type: 'integer', default: 10 }
                        }
                    },
                    response: {
                        200: {
                            description: 'Список избранных анекдотов',
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'number' },
                                    text: { type: 'string' },
                                    hasBadWords: { type: 'boolean' },
                                    lastModifiedDate: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            }, FavoriteController.apiV1FavoritesGET);
            console.log('✅ GET /api/v1/favorites');
        }

        console.log('✅ All routes registered with Swagger documentation');
    }

    async launch() {
        try {
            await this.setupMiddleware();

            // Обработка ошибок
            this.app.setErrorHandler((err, req, res) => {
                console.error('Error:', err);
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
            console.log(`📚 Swagger UI: http://localhost:${this.port}/documentation`);
            console.log(`📖 Swagger JSON: http://localhost:${this.port}/documentation/json`);
            console.log(`❤️  Health check: http://localhost:${this.port}/api/health`);
            console.log(`📝 Feed: http://localhost:${this.port}/api/v1/feed?page=1&limit=10`);
            console.log(`🔑 Login: POST http://localhost:${this.port}/api/v1/login`);

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