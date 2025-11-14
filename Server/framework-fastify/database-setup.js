import { Pool } from 'pg';

export async function setupTestDatabase() {
    const pool = new Pool({
        host: process.env.DATABASE_HOST || 'localhost',
        port: process.env.DATABASE_PORT || 5432,
        database: process.env.DATABASE_NAME || 'anekdot_test',
        user: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'password',
    });

    try {
        await pool.query(`
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

        await pool.query('TRUNCATE TABLE actor, anekdot, favourites RESTART IDENTITY CASCADE');

        await pool.query(`
            INSERT INTO actor (login, password, name, role) VALUES 
            ('tesuser', 'hashpaword', 'TestUser', 1),
            ('user1', 'userass1', 'UserOne', 0),
            ('user2', 'userpas2', 'UserTwo', 0)
        `);

        await pool.query(`
            INSERT INTO anekdot (content, hasbadwords, loaddate) VALUES 
            ('Test joke content 1', false, NOW()),
            ('Test joke content 2', false, NOW()),
            ('Test joke content 3', false, NOW()),
            ('Test joke content 4', false, NOW()),
            ('Test joke content 5', false, NOW()),
            ('Test joke content 6', false, NOW())
        `);

        console.log('✅ E2E test database populated');
    } catch (error) {
        console.error('❌ Failed to setup E2E test database:', error);
        throw error;
    } finally {
        await pool.end();
    }
}