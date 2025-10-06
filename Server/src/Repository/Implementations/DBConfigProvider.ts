import { injectable } from "inversify";
import { IDBConfigProvider, IDBConfig } from "@IRepository/IDBConfigProvider";

@injectable()
export class DBConfigProvider implements IDBConfigProvider {
    getConfig(): IDBConfig {
        return {
            user: process.env.USER!,
            host: process.env.HOST!,
            database: process.env.DATABASE_NAME!,
            password: process.env.PASSWORD!,
            port: Number(process.env.PORT!),
        };
    }
}