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

export class BadTokenError extends AppError {
    constructor() {
        super('Не валидный токен', 401, 'UNAUTHORIZED');
    }
}

export class PermissionError extends AppError {
    constructor() {
        super('Нет прав', 403, 'FORBIDDEN');
    }
}

export class CredentialsError extends AppError {
    constructor() {
        super('Неверный логин или пароль', 401, 'FORBIDDEN');
    }
}

export class CredentialsFormatError extends AppError {
    constructor() {
        super('Некорректный формат логина, пароля, имени или роли', 400, 'BAD_CREDENTIALS');
    }
}

export class BusyCredentialsError extends AppError {
    constructor() {
        super('Логин или имя заняты', 409, 'BUSY_CREDENTIALS');
    }
}

export class WrongIDError extends AppError {
    constructor() {
        super('Неверный идентификатор', 400, 'BAD_ID');
    }
}

export class NOAnekdotError extends AppError {
    constructor() {
        super('Анекдот не найден', 404, 'NO_ANEKDOT');
    }
}

export class AnekdotInFavouritesError extends AppError {
    constructor() {
        super('Анекдот уже в избранном', 409, 'ANEKDOT_IN_FAVORITES');
    }
}