import {Pool, PoolClient} from "pg";
import {DatabaseConfig} from "@Core/Config/database-config";

export class TestDBHelper {
    private testDBConfig = DatabaseConfig.getConfig();

    async get_client(): Promise<PoolClient> {
        const appPool = new Pool(this.testDBConfig);
        return await appPool.connect();
    }

    async ensureTestDatabase(): Promise<void> {
        const systemPool = new Pool({
            ...this.testDBConfig,
            database: 'postgres'
        });

        const client = await systemPool.connect();
        try {
            const result = await client.query(
                "SELECT 1 FROM pg_database WHERE datname = $1",
                [this.testDBConfig.database]
            );

            if (result.rowCount === 0) {
                console.log(`Creating test database: ${this.testDBConfig.database}`);
                await client.query(`CREATE DATABASE ${this.testDBConfig.database}`);
            }

            await this.initializeSchema();
        } finally {
            client.release();
            await systemPool.end();
        }
    }

    private async initializeSchema(): Promise<void> {
        const appPool = new Pool(this.testDBConfig);
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
                    userid INTEGER NOT NULL REFERENCES actor(id),
                    anekdotid INTEGER NOT NULL REFERENCES anekdot(id),
                    UNIQUE (userid, anekdotid)
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

    async fillTestDB(): Promise<void> {
        const appPool = new Pool(this.testDBConfig);
        const client = await appPool.connect();
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

    async cleanTestDB(): Promise<void> {
        const appPool = new Pool(this.testDBConfig);
        const client = await appPool.connect();
        try {
            await client.query('TRUNCATE TABLE favourites, anekdot, actor, nonstandartlexic RESTART IDENTITY CASCADE');
        } finally {
            client.release();
        }
    }
}