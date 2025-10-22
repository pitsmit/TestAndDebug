import {inject, injectable} from "inversify";
import {IUserFavouritesRepository} from "@IRepository/IUserFavouritesRepository";
import {IDBconnection} from "@IRepository/IDBconnection";
import {Anekdot} from "@Core/Essences/anekdot";
import {PoolClient, QueryResult} from "pg";
import {AnekdotInFavouritesError, ErrorFactory, NOAnekdotError, PaginationError} from "@Essences/Errors";

@injectable()
export class UserFavouritesRepository implements IUserFavouritesRepository {
    constructor(
        @inject("IDBconnection") private DB: IDBconnection,
    ) {}

    async add(user_id: number, anekdot_id: number) : Promise<{content: string, hasBadWords: boolean, lastModifiedDate: Date}> {
        let client: PoolClient = await this.DB.connect();

        try {
            const res = await client.query(`SELECT content, hasbadwords, loaddate from anekdot WHERE  id = $1`, [anekdot_id]);
            if (!res.rowCount) throw ErrorFactory.create(NOAnekdotError);

            try {
                await client.query(`INSERT INTO favourites (userid, anekdotid) VALUES ($1, $2)`, [user_id, anekdot_id]);
            } catch (e) {
                throw ErrorFactory.create(AnekdotInFavouritesError);
            }

            return {content: res.rows[0].content, hasBadWords: res.rows[0].hasbadwords, lastModifiedDate: res.rows[0].loaddate};
        } finally {
            client.release();
        }
    }

    async remove(user_id: number, anekdot_id: number) : Promise<void> {
        let client: PoolClient = await this.DB.connect();

        try {
            const countResult = await client.query(`SELECT * from favourites WHERE anekdotid = $1 AND userid = $2`, [anekdot_id, user_id]);
            if (!countResult.rowCount) throw ErrorFactory.create(NOAnekdotError);

            const query = `
            DELETE FROM favourites
            WHERE userid = $1 AND anekdotid = $2`;

            await client.query(query, [user_id, anekdot_id]);
        }
        finally {
            client.release();
        }
    }

    async get_part(user_id: number, page: number = 1, limit: number = 10): Promise<Anekdot[]> {
        if (page < 1 || limit < 1) throw ErrorFactory.create(PaginationError);
        let client: PoolClient = await this.DB.connect();

        try {
            const offset: number = (page - 1) * limit;

            const countResult = await client.query(`SELECT COUNT(*) FROM favourites WHERE userid = $1`, [user_id]);
            const totalCount = parseInt(countResult.rows[0].count);
            const totalPages = Math.ceil(totalCount / limit);

            if (page > totalPages && totalPages > 0) {
                throw ErrorFactory.create(PaginationError);
            }

            const query = `
                SELECT a.id, a.content, a.hasbadwords, a.loaddate
                FROM anekdot a
                         JOIN favourites f ON a.id = f.anekdotid
                WHERE f.userid = $1
                LIMIT $2 OFFSET $3`;

            const res: QueryResult = await client.query(query, [user_id, limit, offset]);
            return res.rows.map(row => new Anekdot(row.content, row.hasbadwords, row.loaddate, row.id));
        } finally {
            client.release();
        }
    }
}