import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Person } from "@Core/Essences/person";
import { Facade } from "@Facade/Facade";
import { container } from "@Facade/container";
import { RegistrateCommand, EntryCommand } from "@UICommands/AuthCommands";
import { ShowLentaCommand } from "@UICommands/LentaCommands";
import { DeleteAnekdotCommand, EditAnekdotCommand, LoadAnekdotCommand } from "@UICommands/AdminCommands";
import { AddToFavouritesCommand, DeleteFromFavouritesCommand, ShowFavouritesCommand } from "@UICommands/UserCommands";
import { logger } from "@Core/Services/logger";
import { ROLE } from "@shared/types/roles";
import { IAuthService } from "@Core/Services/jwt";

export class ApiServer {
    private app: express.Application;
    private facade: Facade;
    private authService: IAuthService;
    private readonly port: number;
    private server: any;

    constructor(port: number = 3000) {
        console.log('🔨 Creating ApiServer instance...');

        this.app = express();
        this.port = port;
        this.facade = new Facade();
        this.authService = container.get<IAuthService>("IAuthService");

        this.setupMiddleware();
        this.setupRoutes();
        console.log('✅ ApiServer instance created');
    }

    private setupMiddleware() {
        console.log('🔧 Setting up middleware...');

        // CORS
        this.app.use(cors());

        // Body parsing
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        // Request logging
        this.app.use((req, res, next) => {
            logger.info(`${req.method} ${req.path}`, {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            next();
        });

        console.log('✅ Middleware setup complete');
    }

    private setupRoutes() {
        console.log('🔧 Setting up routes...');

        // Public routes
        this.app.get('/', this.getRoot.bind(this));
        this.app.get('/api/health', this.getHealth.bind(this));
        this.app.post('/api/auth/login', this.login.bind(this));
        this.app.post('/api/auth/register', this.register.bind(this));
        this.app.get('/api/anekdot/feed', this.getFeed.bind(this));

        // Auth middleware for protected routes
        const authMiddleware = this.authenticateToken.bind(this);
        const adminMiddleware = [this.authenticateToken.bind(this), this.requireAdmin.bind(this)];

        // Protected routes (require authentication)
        this.app.post('/api/anekdot', authMiddleware, this.loadAnekdot.bind(this));
        this.app.put('/api/anekdot/:id', authMiddleware, this.editAnekdot.bind(this));
        this.app.get('/api/favourites', authMiddleware, this.getFavourites.bind(this));
        this.app.post('/api/favourites/:anekdotId', authMiddleware, this.addToFavourites.bind(this));
        this.app.delete('/api/favourites/:anekdotId', authMiddleware, this.removeFromFavourites.bind(this));

        // Admin only routes
        this.app.delete('/api/admin/anekdot/:id', adminMiddleware, this.deleteAnekdot.bind(this));

        this.app.use(this.notFound.bind(this));
        this.app.use(this.errorHandler.bind(this));
        console.log('✅ Routes setup complete');
    }

    // ========== PUBLIC ROUTES ==========

    private getRoot(req: express.Request, res: express.Response) {
        res.json({
            message: '🎉 Анекдот API Server is running!',
            timestamp: new Date().toISOString(),
            endpoints: {
                public: [
                    'GET  /api/health',
                    'GET  /api/anekdot/feed',
                    'POST /api/auth/login',
                    'POST /api/auth/register'
                ],
                authenticated: [
                    'POST /api/anekdot',
                    'PUT  /api/anekdot/:id',
                    'GET  /api/favourites',
                    'POST /api/favourites/:id',
                    'DELETE /api/favourites/:id'
                ],
                admin: [
                    'DELETE /api/admin/anekdot/:id'
                ]
            }
        });
    }

    private getHealth(req: express.Request, res: express.Response) {
        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            message: '🚀 Server is healthy!'
        });
    }

    private async login(req: express.Request, res: express.Response) {
        try {
            const { login, password } = req.body;

            if (!login || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Логин и пароль обязательны'
                });
            }

            const command = new EntryCommand(login, password);
            await this.facade.execute(command);

            const person = (command as any).person;
            if (!person) {
                return res.status(401).json({
                    success: false,
                    error: 'Неверный логин или пароль'
                });
            }

            const token = this.authService.generateToken(person.login);

            res.json({
                success: true,
                user: {
                    id: person.id,
                    login: person.login,
                    name: person.name,
                    role: person.role
                },
                token: token
            });

        } catch (error: any) {
            logger.error('Login error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    private async register(req: express.Request, res: express.Response) {
        try {
            const { login, password, name, role = ROLE.USER } = req.body;

            if (!login || !password || !name) {
                return res.status(400).json({
                    success: false,
                    error: 'Логин, пароль и имя обязательны'
                });
            }

            const command = new RegistrateCommand(login, password, name, role);
            await this.facade.execute(command);

            const person = (command as any).person;
            const token = this.authService.generateToken(person.login);

            res.json({
                success: true,
                user: {
                    id: person.id,
                    login: person.login,
                    name: person.name,
                    role: person.role
                },
                token: token
            });

        } catch (error: any) {
            logger.error('Registration error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    private async getFeed(req: express.Request, res: express.Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const command = new ShowLentaCommand(page, limit);
            await this.facade.execute(command);

            const anekdots = (command as any)._anekdots || [];

            res.json({
                success: true,
                anekdots: anekdots.map((anekdot: any) => ({
                    id: anekdot.id,
                    content: anekdot.text || anekdot.content,
                    hasBadWords: anekdot.hasBadWords,
                    lastModifiedDate: anekdot.lastModifiedDate
                })),
                pagination: { page, limit, total: anekdots.length }
            });

        } catch (error: any) {
            logger.error('Get feed error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // ========== PROTECTED ROUTES ==========

    private async loadAnekdot(req: express.Request, res: express.Response) {
        try {
            const person = (req as any).user;
            const { data } = req.body;

            if (!data) {
                return res.status(400).json({
                    success: false,
                    error: 'Данные анекдота обязательны'
                });
            }

            const command = new LoadAnekdotCommand(person, data);
            await this.facade.execute(command);

            res.json({
                success: true,
                message: 'Анекдот успешно загружен'
            });

        } catch (error: any) {
            logger.error('Load anekdot error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    private async editAnekdot(req: express.Request, res: express.Response) {
        try {
            const person = (req as any).user;
            const anekdotId = parseInt(req.params.id);
            const { content } = req.body;

            if (!content) {
                return res.status(400).json({
                    success: false,
                    error: 'Текст анекдота обязателен'
                });
            }

            const command = new EditAnekdotCommand(person, anekdotId, content);
            await this.facade.execute(command);

            res.json({
                success: true,
                message: 'Анекдот успешно обновлен'
            });

        } catch (error: any) {
            logger.error('Edit anekdot error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    private async deleteAnekdot(req: express.Request, res: express.Response) {
        try {
            const person = (req as any).user;
            const anekdotId = parseInt(req.params.id);

            const command = new DeleteAnekdotCommand(person, anekdotId);
            await this.facade.execute(command);

            res.json({
                success: true,
                message: 'Анекдот успешно удален'
            });

        } catch (error: any) {
            logger.error('Delete anekdot error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    private async getFavourites(req: express.Request, res: express.Response) {
        try {
            const person = (req as any).user;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const command = new ShowFavouritesCommand(person, page, limit);
            await this.facade.execute(command);

            const anekdots = (command as any)._anekdots || [];

            res.json({
                success: true,
                anekdots: anekdots.map((anekdot: any) => ({
                    id: anekdot.id,
                    content: anekdot.text || anekdot.content,
                    hasBadWords: anekdot.hasBadWords,
                    lastModifiedDate: anekdot.lastModifiedDate
                })),
                pagination: { page, limit, total: anekdots.length }
            });

        } catch (error: any) {
            logger.error('Get favourites error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    private async addToFavourites(req: express.Request, res: express.Response) {
        try {
            const person = (req as any).user;
            const anekdotId = parseInt(req.params.anekdotId);

            const command = new AddToFavouritesCommand(person, anekdotId);
            await this.facade.execute(command);

            res.json({
                success: true,
                message: 'Анекдот добавлен в избранное'
            });

        } catch (error: any) {
            logger.error('Add to favourites error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    private async removeFromFavourites(req: express.Request, res: express.Response) {
        try {
            const person = (req as any).user;
            const anekdotId = parseInt(req.params.anekdotId);

            const command = new DeleteFromFavouritesCommand(person, anekdotId);
            await this.facade.execute(command);

            res.json({
                success: true,
                message: 'Анекдот удален из избранного'
            });

        } catch (error: any) {
            logger.error('Remove from favourites error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // ========== MIDDLEWARE ==========

    private authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

            if (!token) {
                return res.status(401).json({
                    success: false,
                    error: 'Токен доступа обязателен'
                });
            }

            // Создаем объект пользователя для использования в запросах
            (req as any).user = new Person(
                token,
                '', // name будет заполнен при реальной аутентификации
                ROLE.USER // role будет заполнен при реальной аутентификации
            );

            next();
        } catch (error: any) {
            logger.error('Token verification error:', error);
            res.status(403).json({
                success: false,
                error: 'Недействительный токен'
            });
        }
    }

    private requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
        const user = (req as any).user;

        if (!user || user.role !== ROLE.ADMIN) {
            return res.status(403).json({
                success: false,
                error: 'Требуются права администратора'
            });
        }

        next();
    }

    private notFound(req: express.Request, res: express.Response) {
        res.status(404).json({
            success: false,
            error: 'Маршрут не найден',
            path: req.path
        });
    }

    private errorHandler(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
        logger.error('Unhandled error:', err);
        res.status(500).json({
            success: false,
            error: 'Внутренняя ошибка сервера'
        });
    }

    // ========== SERVER MANAGEMENT ==========

    public start(): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log(`🎯 Starting server on port ${this.port}...`);

            this.server = this.app.listen(this.port, () => {
                console.log('🚀 API Server started successfully!');
                console.log(`📡 Access URLs:`);
                console.log(`   http://localhost:${this.port}/`);
                console.log(`   http://localhost:${this.port}/api/health`);
                console.log(`   http://localhost:${this.port}/api/anekdot/feed`);
                console.log(`\n🔐 Authentication required for:`);
                console.log(`   POST/PUT/DELETE endpoints`);
                resolve();
            }).on('error', (error) => {
                console.error('❌ Failed to start server:', error);
                reject(error);
            });
        });
    }

    public stop(): Promise<void> {
        return new Promise((resolve) => {
            if (this.server) {
                this.server.close(() => {
                    console.log('🛑 Server stopped');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}