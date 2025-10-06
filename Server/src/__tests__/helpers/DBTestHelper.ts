import { IDBconnection } from "@IRepository/IDBconnection";
import { TEST_DB_CONFIG } from "./test-config";
import { Pool } from "pg";

export class TestDBHelper {
    private testDBName = TEST_DB_CONFIG.database;

    async ensureTestDatabase(): Promise<void> {
        const systemPool = new Pool({
            ...TEST_DB_CONFIG,
            database: 'postgres'
        });

        const client = await systemPool.connect();
        try {
            const result = await client.query(
                "SELECT 1 FROM pg_database WHERE datname = $1",
                [this.testDBName]
            );

            if (result.rowCount === 0) {
                console.log(`Creating test database: ${this.testDBName}`);
                await client.query(`CREATE DATABASE ${this.testDBName}`);
                await this.initializeSchema();
            }
        } finally {
            client.release();
            await systemPool.end();
        }

        await this.initializeSchema();
    }

    private async initializeSchema(): Promise<void> {
        const appPool = new Pool(TEST_DB_CONFIG);
        const client = await appPool.connect();

        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS anekdot (
                    id SERIAL PRIMARY KEY,
                    content TEXT NOT NULL,
                    hasbadwords BOOLEAN,
                    loaddate TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS actor (
                    id SERIAL PRIMARY KEY,
                    login VARCHAR(10) UNIQUE CHECK (login ~ '^[A-Za-z0-9]+$'),
                    password VARCHAR(10) CHECK (password ~ '^[A-Za-z0-9]+$'),
                    name VARCHAR(10) UNIQUE CHECK (name ~ '^[A-Za-z0-9]+$'),
                    role INTEGER DEFAULT 0
                );
                
                CREATE TABLE IF NOT EXISTS favourites (
                    id SERIAL PRIMARY KEY,
                    userid INTEGER,
                    anekdotid INTEGER REFERENCES anekdot
                );
                
                CREATE TABLE IF NOT EXISTS nonstandartlexic (
                    id SERIAL PRIMARY KEY,
                    word VARCHAR NOT NULL
                );
            `);
            console.log('✅ Database schema created');
        } finally {
            client.release();
            await appPool.end();
        }
    }

    async fillTestDB(dbConnection: IDBconnection): Promise<void> {
        const client = await dbConnection.connect();
        try {
            await client.query(`
                INSERT INTO actor (login, password, name, role) VALUES
                                                                    ('admin', 'adminpass', 'adminuser', 1),
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

    async cleanTestDB(dbConnection: IDBconnection): Promise<void> {
        const client = await dbConnection.connect();
        try {
            await client.query('TRUNCATE TABLE favourites, anekdot, actor, nonstandartlexic RESTART IDENTITY CASCADE');
        } finally {
            client.release();
        }
    }
}