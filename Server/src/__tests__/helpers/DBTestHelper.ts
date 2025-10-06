import { IDBConfig } from "@IRepository/IDBConfigProvider";
import {IDBconnection} from "@IRepository/IDBconnection";
import {Pool} from "pg";

export const TEST_DB_CONFIG: IDBConfig = {
    user: 'postgres',
    host: 'localhost',
    database: 'anekdot_test',
    password: '1234',
    port: 5432,
};

export class TestDBHelper {
    private testDBName = 'anekdot_test';

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
                await client.query(`CREATE DATABASE ${this.testDBName}`);
            }
        } finally {
            client.release();
            await systemPool.end();
        }
    }

    async fillTestDB(dbConnection: IDBconnection): Promise<void> {
        const client = await dbConnection.connect();
        try {
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

    async cleanTestDB(dbConnection: IDBconnection): Promise<void> {
        const client = await dbConnection.connect();
        try {
            await client.query('TRUNCATE TABLE favourites, anekdot, actor, nonstandartlexic RESTART IDENTITY CASCADE');
        } finally {
            client.release();
        }
    }
}