import { injectable } from "inversify";
import { IDBConfigProvider, IDBConfig } from "@IRepository/IDBConfigProvider";
import { TEST_DB_CONFIG } from "./test-config";

@injectable()
export class TestDBConfigProvider implements IDBConfigProvider {
    getConfig(): IDBConfig {
        return TEST_DB_CONFIG;
    }
}