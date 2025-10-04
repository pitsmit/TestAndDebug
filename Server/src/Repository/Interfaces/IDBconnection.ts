import {Pool, PoolClient} from "pg";

export interface IDBconnection {
    connect() : Promise<PoolClient>;
    pool: Pool;
}