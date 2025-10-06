import { injectable } from "inversify";
import { IDBConfigProvider, IDBConfig } from "@IRepository/IDBConfigProvider";

@injectable()
export class TestDBConfigProvider implements IDBConfigProvider {
    getConfig(): IDBConfig {
        return {
            user: 'postgres',
            host: 'localhost',
            database: 'anekdot_test',
            password: 'password',
            port: 5432,
        };
    }
}