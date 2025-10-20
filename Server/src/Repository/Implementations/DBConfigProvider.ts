import { injectable } from "inversify";
import { IDBConfigProvider, IDBConfig } from "@IRepository/IDBConfigProvider";
import { DatabaseConfig } from "@Core/Config/database-config";

@injectable()
export class DBConfigProvider implements IDBConfigProvider {
    getConfig(): IDBConfig {
        return DatabaseConfig.getConfig();
    }
}