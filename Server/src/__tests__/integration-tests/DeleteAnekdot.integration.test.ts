import { container } from "@Facade/container";
import { TestDBConnection } from "../helpers/DBTestHelper";
import { TestDBConnectionAdapter } from "../helpers/TestDBConnectionAdapter";
import {AdminManager, IAdminManager} from "@Essences/AdminManager";
import {AnekdotRepository} from "@Repository/AnekdotRepository";
import {PersonBuilder} from "@/__tests__/helpers/PersonBuilder";
import {AuthDataMother} from "@/__tests__/helpers/AuthDataMother";

describe('DeleteAnekdot', () => {
    const personbuilder = new PersonBuilder();
    let authmother: AuthDataMother = new AuthDataMother();
    let userData: {login: string, password: string, name: string, role: number};
    let adminmanager: IAdminManager;
    let testDB = new TestDBConnection();

    beforeAll(async () => {
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

    test('Админ удаляет анекдот', async () => {
        // ARRANGE
        userData = authmother.CreateValidUserData();
        const adminUser = personbuilder
            .withToken('token')
            .withLogin(userData.login)
            .withName(userData.name)
            .withRole(userData.role)
            .create();
        const anekdot_id: number = 1;

        // ACT
        await adminmanager.DeleteAnekdot(adminUser, anekdot_id);

        // ASSERT
        const client = await testDB.connect();
        try {
            const result = await client.query('SELECT * FROM anekdot WHERE id = $1', [anekdot_id]);
            expect(result.rowCount).toBe(0);
        } finally {
            client.release();
        }
    });
});