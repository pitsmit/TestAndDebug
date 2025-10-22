import {PoolClient, QueryResult} from 'pg';
import {IAnekdotRepository} from "@IRepository/IAnekdotRepository";
import {inject, injectable} from "inversify";
import {Anekdot} from "@Core/Essences/anekdot";
import {IDBconnection} from "@IRepository/IDBconnection";
import {EmptyAnekdotError, ErrorFactory, NOAnekdotError, PaginationError, WrongIDError} from "@Essences/Errors";

@injectable()
export class AnekdotRepository implements IAnekdotRepository {
    constructor(@inject("IDBconnection") private DB: IDBconnection) {}

    async get_part(page: number = 1, limit: number = 10): Promise<Anekdot[]> {
        let client: PoolClient = await this.DB.connect();

        try {
            const offset: number = (page - 1) * limit;
            const res: QueryResult = await client.query(`SELECT * FROM Anekdot ORDER BY loaddate DESC LIMIT $1 OFFSET $2`, [limit, offset]);
            return res.rows.map(row => new Anekdot(row.content, row.hasbadwords, row.loaddate, row.id));
        }
        catch (e: any) {
            throw ErrorFactory.create(PaginationError, e.message);
        }
        finally {
            client.release();
        }
    }

    async delete(id: number): Promise<void> {
        if (id <= 0) throw ErrorFactory.create(WrongIDError);
        let client: PoolClient = await this.DB.connect();

        try {
            await client.query('DELETE FROM Favourites WHERE AnekdotID = $1', [id]);
            const result = await client.query('DELETE FROM Anekdot WHERE ID = $1', [id]);
            if (result.rowCount == 0) throw new NOAnekdotError();
        } finally {
            client.release();
        }
    }

    async load(text: string, hasBadWords: boolean, lastModifiedDate: Date): Promise<number> {
        if (!text.trim().length)
            throw ErrorFactory.create(EmptyAnekdotError, `Пустой текст анекдота`);

        let client: PoolClient = await this.DB.connect();

        try {
            const query = `INSERT INTO Anekdot (content, hasbadwords, loaddate)
                            VALUES ($1, $2, $3) RETURNING id`;
            const res = await client.query(query, [text, hasBadWords, lastModifiedDate]);
            return res.rows[0].id;
        } finally {
            client.release();
        }
    }

    async edit(id: number, text: string, hasBadWords: boolean, lastModifiedDate: Date): Promise<void> {
        if (!text.trim().length)
            throw ErrorFactory.create(EmptyAnekdotError, `Пустой текст анекдота`);
        if (id <= 0) throw ErrorFactory.create(WrongIDError);
        let client: PoolClient = await this.DB.connect();

        try {
            const result = await client.query(
                `UPDATE Anekdot SET content = $1, loaddate = $2, hasbadwords = $3 WHERE id = $4`,
                [text, lastModifiedDate, hasBadWords, id]
            );
            if (result.rowCount == 0) throw ErrorFactory.create(NOAnekdotError);
        } finally {
            client.release();
        }
    }
}