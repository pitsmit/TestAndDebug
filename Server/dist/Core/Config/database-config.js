"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DatabaseConfig = void 0;
class DatabaseConfig {
  static getConfig() {
    return {
      user: process.env.USER || 'postgres',
      host: process.env.HOST || 'localhost',
      database: process.env.DATABASE_NAME || 'anekdot_test',
      password: process.env.PASSWORD || 'password',
      port: Number(process.env.PORT) || 5432
    };
  }
}
exports.DatabaseConfig = DatabaseConfig;