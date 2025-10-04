import { Pool, PoolClient } from "pg";
import { IDBconnection } from "@IRepository/IDBconnection";
import { TestDBConnection } from "./DBTestHelper";

export class TestDBConnectionAdapter implements IDBconnection {
    private readonly _pool: Pool;

    constructor(con: TestDBConnection) {
        this._pool = con.pool;
    }

    async connect(): Promise<PoolClient> {
        return await this._pool.connect();
    }

    get pool(): Pool {
        return this._pool;
    }
}