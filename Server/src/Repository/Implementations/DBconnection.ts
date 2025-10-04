import {Pool, PoolClient} from "pg";
import { injectable } from "inversify";
import {logger} from "@Core/Services/logger";
import * as dotenv from "dotenv";
import {IDBconnection} from "@IRepository/IDBconnection";

@injectable()
export class DBconnection implements IDBconnection {
    private readonly _pool!: Pool;

    constructor() {
        try {
            const res = dotenv.config();
            const env = res.parsed!;
            this._pool = new Pool({
                user: env.USER,
                host: env.HOST,
                database: env.DATABASE_NAME,
                password: env.PASSWORD,
                port: Number(env.PORT),
            });
        } catch (error: any) {
            logger.fatal(error.message);
            throw error;
        }
    }

    async connect() : Promise<PoolClient> {
        let client: PoolClient;
        try {
            client = await this.pool.connect();
        } catch (err: any) {
            logger.fatal(`База недоступна ${err.message}`);
            throw err;
        }

        return client;
    }

    get pool(): Pool {
        return this._pool;
    }
}
