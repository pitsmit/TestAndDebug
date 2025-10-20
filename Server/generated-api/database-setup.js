import { Pool } from 'pg';

export async function setupTestDatabase() {
    const pool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'anekdot_test',
        user: 'postgres',
        password: 'password',
    });

    try {
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