"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WrongIDError = exports.PermissionError = exports.PaginationError = exports.NOAnekdotError = exports.EmptyAnekdotError = exports.DatabaseConnectionError = exports.CredentialsFormatError = exports.CredentialsError = exports.BusyNameError = exports.BusyLoginError = exports.BusyCredentialsError = exports.BadTokenError = exports.AppError = exports.AnekdotInFavouritesError = void 0;
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = this.constructor.name;
  }
}
exports.AppError = AppError;
class DatabaseConnectionError extends AppError {
  constructor() {
    super('Разорвано соединение с БД', 503, 'DB_CONNECTION_ERROR');
  }
}
exports.DatabaseConnectionError = DatabaseConnectionError;
class PaginationError extends AppError {
  constructor() {
    super('Некорректные параметры пагинации', 400, 'INVALID_PAGINATION');
  }
}
exports.PaginationError = PaginationError;
class EmptyAnekdotError extends AppError {
  constructor(msg) {
    super(msg, 400, 'EMPTY_ANEKDOT');
  }
}
exports.EmptyAnekdotError = EmptyAnekdotError;
class BadTokenError extends AppError {
  constructor() {
    super('Не валидный токен', 401, 'UNAUTHORIZED');
  }
}
exports.BadTokenError = BadTokenError;
class PermissionError extends AppError {
  constructor() {
    super('Нет прав', 403, 'FORBIDDEN');
  }
}
exports.PermissionError = PermissionError;
class CredentialsError extends AppError {
  constructor(message) {
    super(message, 401, 'FORBIDDEN');
  }
}
exports.CredentialsError = CredentialsError;
class CredentialsFormatError extends AppError {
  constructor() {
    super('Некорректный формат логина, пароля, имени или роли', 400, 'BAD_CREDENTIALS');
  }
}
exports.CredentialsFormatError = CredentialsFormatError;
class BusyCredentialsError extends AppError {
  constructor(message) {
    super(message, 409, 'BUSY_CREDENTIALS');
  }
}
exports.BusyCredentialsError = BusyCredentialsError;
class BusyLoginError extends AppError {
  constructor(message) {
    super(message, 409, 'BUSY_CREDENTIALS');
  }
}
exports.BusyLoginError = BusyLoginError;
class BusyNameError extends AppError {
  constructor(message) {
    super(message, 409, 'BUSY_CREDENTIALS');
  }
}
exports.BusyNameError = BusyNameError;
class WrongIDError extends AppError {
  constructor() {
    super('Неверный идентификатор', 400, 'BAD_ID');
  }
}
exports.WrongIDError = WrongIDError;
class NOAnekdotError extends AppError {
  constructor() {
    super('Анекдот не найден', 404, 'NO_ANEKDOT');
  }
}
exports.NOAnekdotError = NOAnekdotError;
class AnekdotInFavouritesError extends AppError {
  constructor() {
    super('Анекдот уже в избранном', 409, 'ANEKDOT_IN_FAVORITES');
  }
}
exports.AnekdotInFavouritesError = AnekdotInFavouritesError;