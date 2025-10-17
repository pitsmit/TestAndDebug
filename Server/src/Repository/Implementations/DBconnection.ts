import {Pool, PoolClient} from "pg";
import {injectable, inject} from "inversify";
import {logger} from "@Core/Services/logger";
import {IDBconnection} from "@IRepository/IDBconnection";
import {IDBConfigProvider} from "@IRepository/IDBConfigProvider";
import {DatabaseConnectionError} from "@Essences/Errors";

@injectable()
export class DBconnection implements IDBconnection {
    private readonly _pool: Pool;

    constructor(
        @inject("IDBConfigProvider") private configProvider: IDBConfigProvider
    ) {
        const config = this.configProvider.getConfig();
        this._pool = new Pool(config);
    }

    async connect() : Promise<PoolClient> {
        try {
            return await this._pool.connect();
        } catch (err: any) {
            logger.fatal(`База недоступна ${err.message}`);
            throw new DatabaseConnectionError();
        }
    }

    get pool(): Pool {
        return this._pool;
    }
}