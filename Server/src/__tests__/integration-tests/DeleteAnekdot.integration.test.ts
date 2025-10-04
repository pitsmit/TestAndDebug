import { container } from "@Facade/container";
import { TestDBConnection } from "../helpers/DBTestHelper";
import { TestDBConnectionAdapter } from "../helpers/TestDBConnectionAdapter";
import {AdminManager, IAdminManager} from "@Essences/AdminManager";
import {AnekdotRepository} from "@Repository/AnekdotRepository";
import {PersonBuilder} from "@/__tests__/helpers/PersonBuilder";
import {AuthDataMother} from "@/__tests__/helpers/AuthDataMother";
import {parameter, step} from "allure-js-commons";
import {Person} from "@Essences/person";

describe('Удаление анекдота', () => {
    const personbuilder = new PersonBuilder();
    let authmother: AuthDataMother = new AuthDataMother();
    let userData: {login: string, password: string, name: string, role: number};
    let adminmanager: IAdminManager;
    let testDB = new TestDBConnection();

    beforeAll(async () => {
        /// так как будут ещё тесты подумать куда вынести инициализацию базы(в общий какой-то файл)
        await testDB.initTestDB();

        await container.unbindAll();
        container.bind("IAnekdotRepository").to(AnekdotRepository);
        container.bind("IDBconnection").toConstantValue(new TestDBConnectionAdapter(testDB));
        container.bind("IAdminManager").to(AdminManager);

        adminmanager = container.get<IAdminManager>("IAdminManager");
    });

    afterAll(async () => {
        await testDB.cleanTestDB();
        await testDB.close();
    });

    test('Корректное удаление анекдота', async () => {
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
            const client = await testDB.connect();
            try {
                const result = await client.query('SELECT * FROM anekdot WHERE id = $1', [anekdot_id]);
                expect(result.rowCount).toBe(0);
            } finally {
                client.release();
            }
        })
    });
});