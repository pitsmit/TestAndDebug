import { IDBconnection } from "@IRepository/IDBconnection";
import { PoolClient, QueryResult } from "pg";

export class MockPoolClient {
    release = jest.fn();
    query = jest.fn<Promise<QueryResult>, [string, any[]]>();
}

export const mockClient = new MockPoolClient();

export const mockDBConnection: IDBconnection = {
    async connect(): Promise<PoolClient> {
        return mockClient as unknown as PoolClient;
    },
    pool: {} as any
};