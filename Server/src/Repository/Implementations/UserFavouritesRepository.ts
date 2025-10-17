import {inject, injectable} from "inversify";
import {IUserFavouritesRepository} from "@IRepository/IUserFavouritesRepository";
import {IDBconnection} from "@IRepository/IDBconnection";
import {Anekdot} from "@Core/Essences/anekdot";
import {PoolClient, QueryResult} from "pg";

@injectable()
export class UserFavouritesRepository implements IUserFavouritesRepository {
    constructor(
        @inject("IDBconnection") private DB: IDBconnection,
    ) {}

    async add(user_id: number, anekdot_id: number) : Promise<void> {
        let client: PoolClient = await this.DB.connect();

        try {
            const query = `INSERT INTO favourites (userid, anekdotid)
                       VALUES ($1, $2)`;

            await client.query(query, [user_id, anekdot_id]);
        } finally {
            client.release();
        }
    }

    async remove(user_id: number, anekdot_id: number) : Promise<void> {
        let client: PoolClient = await this.DB.connect();

        try {
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
        let client: PoolClient = await this.DB.connect();

        try {
            const offset: number = (page - 1) * limit;

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