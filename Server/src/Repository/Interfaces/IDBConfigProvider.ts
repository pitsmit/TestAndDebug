export interface IDBConfig {
    user: string;
    host: string;
    database: string;
    password: string;
    port: number;
}

export interface IDBConfigProvider {
    getConfig(): IDBConfig;
}