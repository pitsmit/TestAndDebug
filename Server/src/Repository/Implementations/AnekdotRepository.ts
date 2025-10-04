import {PoolClient, QueryResult} from 'pg';
import {IAnekdotRepository} from "@IRepository/IAnekdotRepository";
import {inject, injectable} from "inversify";
import {Anekdot} from "@Core/Essences/anekdot";
import {IDBconnection} from "@IRepository/IDBconnection";
import {logger} from "@Core/Services/logger";

@injectable()
export class AnekdotRepository implements IAnekdotRepository {
    constructor(@inject("IDBconnection") private DB: IDBconnection) {}

    async get_part(page: number = 1, limit: number = 10): Promise<Anekdot[]> {
        let client: PoolClient = await this.DB.connect();

        try {
            const offset: number = (page - 1) * limit;
            const query = `SELECT * FROM Anekdot ORDER BY loaddate DESC LIMIT $1 OFFSET $2`;
            const res: QueryResult = await client.query(query, [limit, offset]);
            return res.rows.map(row => new Anekdot(row.content, row.hasbadwords, row.loaddate, row.id));
        } finally {
            client.release();
        }
    }

    async delete(id: number): Promise<void> {
        let client: PoolClient = await this.DB.connect();

        try {
            await client.query('DELETE FROM Favourites WHERE AnekdotID = $1', [id]);
            await client.query('DELETE FROM Anekdot WHERE ID = $1', [id]);
        } finally {
            client.release();
        }
    }

    async load(anekdot: Anekdot): Promise<void> {
        if (!anekdot.text.trim().length) {
            const msg: string = `Попытка загрузки пустого анекдота`;
            logger.warn(msg);
            throw new Error(msg);
        }

        let client: PoolClient = await this.DB.connect();

        try {
            const query = `INSERT INTO Anekdot (content, hasbadwords, loaddate)
                            VALUES ($1, $2, $3)`;
            await client.query(query, [anekdot.text, anekdot.hasBadWords, anekdot.lastModifiedDate]);
        } finally {
            client.release();
        }
    }

    async edit(id: number, new_text: string): Promise<void> {
        let client: PoolClient = await this.DB.connect();

        try {
            const query = `UPDATE Anekdot SET content = $1, loaddate = $2 WHERE id = $3`;
            await client.query(query, [new_text, new Date(), id]);
        } finally {
            client.release();
        }
    }
}