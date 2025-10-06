import { container } from "@Facade/container";
import { TestDBHelper } from "../helpers/DBTestHelper";
import { IAdminManager } from "@Essences/AdminManager";
import { PersonBuilder } from "@/__tests__/helpers/PersonBuilder";
import { AuthDataMother } from "@/__tests__/helpers/AuthDataMother";
import { parameter, step } from "allure-js-commons";
import { Person } from "@Essences/person";
import { TestDBConfigProvider } from "@/__tests__/helpers/TestDBConfigProvider";
import { IDBConfigProvider } from "@IRepository/IDBConfigProvider";
import { IDBconnection } from "@IRepository/IDBconnection";
import '@Facade/bindings'
import {DBconnection} from "@Repository/DBconnection";

describe('Действия админа с анекдотами', () => {
    const personbuilder = new PersonBuilder();
    let authmother: AuthDataMother = new AuthDataMother();
    let userData: {login: string, password: string, name: string, role: number};
    let adminmanager: IAdminManager;
    let testDBHelper = new TestDBHelper();
    let dbConnection: IDBconnection;

    beforeAll(async () => {
        await container.unbind("IDBConfigProvider");
        await container.unbind("IDBconnection");
        container.bind<IDBConfigProvider>("IDBConfigProvider").to(TestDBConfigProvider).inSingletonScope();
        container.bind<IDBconnection>("IDBconnection").to(DBconnection).inSingletonScope();

        adminmanager = container.get<IAdminManager>("IAdminManager");
        dbConnection = container.get<IDBconnection>("IDBconnection");
    });

    beforeEach(async () => {
        await testDBHelper.cleanTestDB(dbConnection);
        await testDBHelper.fillTestDB(dbConnection);
    })

    afterAll(async () => {
        await testDBHelper.cleanTestDB(dbConnection);

        if (dbConnection && dbConnection.pool) {
            await dbConnection.pool.end();
        }
    });

    test('Удаление анекдота', async () => {
        let anekdot_id: number;
        let adminUser: Person;

        // ARRANGE
        await step('Подготовка тестовых данных', async () => {
            userData = authmother.CreateValidUserData();
            adminUser = personbuilder
                .withToken('token')
                .withLogin(userData.login)
                .withName(userData.name)
                .withRole(userData.role)
                .create();
            anekdot_id = 1;

            await parameter("ID анекдота", String(anekdot_id));
        })

        // ACT
        await step('Выполнение удаления', async () => {
            await adminmanager.DeleteAnekdot(adminUser, anekdot_id);
        })

        // ASSERT
        await step('Проверка', async () => {
            const dbConnection = container.get<IDBconnection>("IDBconnection");
            const client = await dbConnection.connect();
            try {
                const result = await client.query('SELECT * FROM anekdot WHERE id = $1', [anekdot_id]);
                expect(result.rowCount).toBe(0);
            } finally {
                client.release();
            }
        })
    });

    test('Редактирование анекдота', async () => {
        let anekdot_id: number;
        let adminUser: Person;
        let new_data: string;

        // ARRANGE
        await step('Подготовка тестовых данных', async () => {
            userData = authmother.CreateValidUserData();
            adminUser = personbuilder
                .withToken('token')
                .withLogin(userData.login)
                .withName(userData.name)
                .withRole(userData.role)
                .create();
            anekdot_id = 1;
            new_data = "New Anekdot Data";

            await parameter("ID анекдота", String(anekdot_id));
            await parameter("Новый текст анекдота", new_data);
        })

        // ACT
        await step('Выполнение редактирвоания', async () => {
            await adminmanager.EditAnekdot(adminUser, anekdot_id, new_data);
        })

        // ASSERT
        await step('Проверка', async () => {
            const dbConnection = container.get<IDBconnection>("IDBconnection");
            const client = await dbConnection.connect();
            try {
                const result = await client.query('SELECT * FROM anekdot WHERE id = $1', [anekdot_id]);
                expect(result.rowCount).toBe(1);
                expect(result.rows[0].content).toBe(new_data);
            } finally {
                client.release();
            }
        })
    });
});