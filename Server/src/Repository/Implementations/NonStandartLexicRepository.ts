import {inject, injectable} from "inversify";
import {INonStandartLexicRepository} from "@IRepository/INonStandartLexicRepository";
import {IDBconnection} from "@IRepository/IDBconnection";
import {PoolClient, QueryResult} from "pg";

@injectable()
export class NonStandartLexicRepository implements INonStandartLexicRepository {
    constructor(@inject("IDBconnection") private DB: IDBconnection) {}

    async containsBadWords(text: string): Promise<boolean> {
        let client: PoolClient = await this.DB.connect();

        try {
            const query = `
            SELECT EXISTS(
                SELECT 1 FROM nonstandartlexic 
                WHERE $1 LIKE '%' || word || '%'
            ) as has_bad_words;`;

            const result: QueryResult = await client.query(query, [text]);
            return result.rows[0].has_bad_words;
        } finally {
            client.release();
        }
    }
}