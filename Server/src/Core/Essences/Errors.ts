// src/Core/Errors/ApiErrors.ts
export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public code?: string
    ) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class DatabaseConnectionError extends AppError {
    constructor() {
        super('Разорвано соединение с БД', 503, 'DB_CONNECTION_ERROR');
    }
}

export class PaginationError extends AppError {
    constructor() {
        super('Некорректные параметры пагинации', 400, 'INVALID_PAGINATION');
    }
}

export class EmptyAnekdotError extends AppError {
    constructor() {
        super('Попытка загрузки пустого анекдота', 400, 'EMPTY_ANEKDOT');
    }
}

export class AuthenticationError extends AppError {
    constructor() {
        super('Не авторизован', 401, 'UNAUTHORIZED');
    }
}

export class PermissionError extends AppError {
    constructor() {
        super('Нет прав', 403, 'FORBIDDEN');
    }
}