// Server/src/__tests__/integration/helpers/DBTestHelper.ts
import { Pool, PoolClient } from "pg";
import * as dotenv from "dotenv";

// Загружаем env переменные
dotenv.config();

// Конфигурация для тестовой БД (берет из env или значения по умолчанию для CI)
const TEST_DB_CONFIG = {
    user: process.env.USER || 'postgres',
    host: process.env.HOST || 'localhost',
    database: process.env.DATABASE_NAME || 'anekdot_test',
    password: process.env.PASSWORD || 'password',
    port: parseInt(process.env.PORT || '5432'),
};

export class TestDBConnection {
    private readonly _pool: Pool;

    constructor() {
        this._pool = new Pool(TEST_DB_CONFIG);
    }

    get pool(): Pool {
        return this._pool;
    }

    async connect(): Promise<PoolClient> {
        return await this._pool.connect();
    }

    async initTestDB(): Promise<void> {
        const client = await this.connect();
        try {
            // Очищаем все таблицы
            await client.query('TRUNCATE TABLE favourites, anekdot, actor, nonstandartlexic RESTART IDENTITY CASCADE');

            // Добавляем тестовые данные
            await client.query(`
                INSERT INTO actor (login, password, name, role) VALUES
                                                                    ('admin', 'adminpass', 'adminuser', 2),
                                                                    ('user1', 'user1pass', 'regularuse', 0)
            `);

            await client.query(`
                INSERT INTO anekdot (content, hasbadwords, loaddate) VALUES
                                                                         ('Test joke content 1', false, NOW()),
                                                                         ('Test joke content 2', false, NOW()),
                                                                         ('Test joke content 3', true, NOW())
            `);

            await client.query(`
        INSERT INTO favourites (userid, anekdotid) VALUES 
        (2, 1)
      `);
        } finally {
            client.release();
        }
    }

    async cleanTestDB(): Promise<void> {
        const client = await this.connect();
        try {
            await client.query('TRUNCATE TABLE favourites, anekdot, actor, nonstandartlexic RESTART IDENTITY CASCADE');
        } finally {
            client.release();
        }
    }

    async close(): Promise<void> {
        if (this._pool) {
            await this._pool.end();
        }
    }
}