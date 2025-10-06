import {IDBconnection} from "@IRepository/IDBconnection";

export class TestDBHelper {
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