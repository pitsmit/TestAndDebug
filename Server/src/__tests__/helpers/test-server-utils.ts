import { ApiServer } from '@/api-server';
import { TestDBHelper } from "../helpers/DBTestHelper";
import { container } from "@Facade/container";
import { IDBconnection } from "@IRepository/IDBconnection";
import { IDBConfigProvider } from "@IRepository/IDBConfigProvider";
import { TestDBConfigProvider } from "@/__tests__/helpers/TestDBConfigProvider";
import { DBconnection } from "@Repository/DBconnection";

export class TestServerManager {
    private apiServer!: ApiServer;
    private testDBHelper!: TestDBHelper;
    private dbConnection!: IDBconnection;
    private isRunning: boolean = false;

    constructor(private port: number = 3000) {}

    async start(): Promise<string> {
        if (this.isRunning) {
            return this.getBaseUrl();
        }

        this.testDBHelper = new TestDBHelper();
        await this.testDBHelper.ensureTestDatabase();

        await container.unbind("IDBConfigProvider");
        await container.unbind("IDBconnection");
        container.bind<IDBConfigProvider>("IDBConfigProvider").to(TestDBConfigProvider).inSingletonScope();
        container.bind<IDBconnection>("IDBconnection").to(DBconnection).inSingletonScope();

        this.dbConnection = container.get<IDBconnection>("IDBconnection");

        this.apiServer = new ApiServer(this.port);
        await this.apiServer.start();

        await this.testDBHelper.cleanTestDB(this.dbConnection);
        await this.testDBHelper.fillTestDB(this.dbConnection);

        this.isRunning = true;
        return this.getBaseUrl();
    }

    async stop(): Promise<void> {
        if (!this.isRunning) return;

        await this.testDBHelper.cleanTestDB(this.dbConnection);
        await this.apiServer.stop();

        if (this.dbConnection && this.dbConnection.pool) {
            await this.dbConnection.pool.end();
        }

        this.isRunning = false;
    }

    getBaseUrl(): string {
        return `http://localhost:3000`;
    }
}