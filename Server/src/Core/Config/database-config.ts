export interface IDBConfig {
    user: string;
    host: string;
    database: string;
    password: string;
    port: number;
}

export class DatabaseConfig {
    static getConfig(): IDBConfig {
        return {
            user: process.env.USER || 'postgres',
            host: process.env.HOST || 'localhost',
            database: process.env.DATABASE_NAME || 'anekdot_test',
            password: process.env.PASSWORD || 'password',
            port: Number(process.env.PORT) || 5432,
        };
    }
}