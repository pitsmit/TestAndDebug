import { container } from "@Facade/container";
import { TestDBHelper } from "@Helpers/DBTestHelper";
import { IAdminManager } from "@Essences/AdminManager";
import { parameter, step } from "allure-js-commons";
import '@Facade/bindings'
import {IAuthService} from "@Services/jwt";
import {ROLE} from "@shared/types/roles";
import {expect} from "@jest/globals";
import {EmptyAnekdotError, NOAnekdotError, WrongIDError} from "@Essences/Errors";
import {Anekdot} from "@Essences/anekdot";

describe('Действия админа с анекдотами', () => {
    let adminmanager: IAdminManager;
    let testDBHelper = new TestDBHelper();
    let jwt_service: IAuthService;
    let token: string;

    beforeAll(async () => {
        process.env.JWT_SECRET = 'test_jwt_secret_for_testing';
        process.env.DATABASE_NAME = 'anekdot_test';

        await testDBHelper.ensureTestDatabase();

        adminmanager = container.get<IAdminManager>("IAdminManager");
        jwt_service = container.get<IAuthService>("IAuthService");
        token = jwt_service.generateToken(1, ROLE.ADMIN);
    });


    beforeEach(async () => {
        await testDBHelper.cleanTestDB();
        await testDBHelper.fillTestDB();
    })

    afterAll(async () => {
        await testDBHelper.cleanTestDB();
        delete process.env.JWT_SECRET;
    });

    test('успешное удаление анекдота', async () => {
        let anekdot_id: number;

        // ARRANGE
        await step('Подготовка тестовых данных', async () => {
            anekdot_id = 1;

            await parameter("ID анекдота", String(anekdot_id));
        })

        // ACT
        await step('Выполнение удаления', async () => {
            await adminmanager.DeleteAnekdot(token, anekdot_id);
        })

        // ASSERT
        await step('Проверка', async () => {
            const client = await testDBHelper.get_client();
            try {
                const result = await client.query('SELECT * FROM anekdot WHERE id = $1', [anekdot_id]);
                expect(result.rowCount).toBe(0);
            } finally {
                client.release();
            }
        })
    });

    test('неуспешное удаление анекдота из-за некорректного идентификатора анекдота', async () => {
        let anekdot_id: number;
        let act: Promise<void>;

        // ARRANGE
        await step('Подготовка тестовых данных', async () => {
            anekdot_id = -1;

            await parameter("ID анекдота", String(anekdot_id));
        })

        // ACT
        await step('Выполнение удаления', async () => {
            act = adminmanager.DeleteAnekdot(token, anekdot_id);
        })

        // ASSERT
        await step('Проверка', async () => {
            await expect(act).rejects.toThrow(WrongIDError);
        })
    });

    test('неуспешное удаление анекдота из-за его отсутствия', async () => {
        let anekdot_id: number;
        let act: Promise<void>;

        // ARRANGE
        await step('Подготовка тестовых данных', async () => {
            anekdot_id = 9999999;

            await parameter("ID анекдота", String(anekdot_id));
        })

        // ACT
        await step('Выполнение удаления', async () => {
            act = adminmanager.DeleteAnekdot(token, anekdot_id);
        })

        // ASSERT
        await step('Проверка', async () => {
            await expect(act).rejects.toThrow(NOAnekdotError);
        })
    });

    test('успешное редактирование анекдота', async () => {
        let anekdot_id: number;
        let new_data: string;

        // ARRANGE
        await step('Подготовка тестовых данных', async () => {
            anekdot_id = 1;
            new_data = "New Anekdot Data";

            await parameter("ID анекдота", String(anekdot_id));
            await parameter("Новый текст анекдота", new_data);
        })

        // ACT
        await step('Выполнение редактирования', async () => {
            await adminmanager.EditAnekdot(token, anekdot_id, new_data);
        })

        // ASSERT
        await step('Проверка', async () => {
            const client = await testDBHelper.get_client();
            try {
                const result = await client.query('SELECT * FROM anekdot WHERE id = $1', [anekdot_id]);
                expect(result.rowCount).toBe(1);
                expect(result.rows[0].content).toBe(new_data);
            } finally {
                client.release();
            }
        })
    });

    test('неуспешное редактирование анекдота из-за попытки залить пустой анекдот', async () => {
        let anekdot_id: number;
        let new_data: string;
        let act: Promise<Anekdot>;

        // ARRANGE
        await step('Подготовка тестовых данных', async () => {
            anekdot_id = 1;
            new_data = "";

            await parameter("ID анекдота", String(anekdot_id));
            await parameter("Новый текст анекдота", new_data);
        })

        // ACT
        await step('Выполнение редактирования', async () => {
            act = adminmanager.EditAnekdot(token, anekdot_id, new_data);
        })

        // ASSERT
        await step('Проверка', async () => {
            await expect(act).rejects.toThrow(EmptyAnekdotError);
        })
    });

    test('неуспешное редактирование анекдота из-за неверного id', async () => {
        let anekdot_id: number;
        let new_data: string;
        let act: Promise<Anekdot>;

        // ARRANGE
        await step('Подготовка тестовых данных', async () => {
            anekdot_id = -1;
            new_data = "New Anekdot Data";

            await parameter("ID анекдота", String(anekdot_id));
            await parameter("Новый текст анекдота", new_data);
        })

        // ACT
        await step('Выполнение редактирования', async () => {
            act = adminmanager.EditAnekdot(token, anekdot_id, new_data);
        })

        // ASSERT
        await step('Проверка', async () => {
            await expect(act).rejects.toThrow(WrongIDError);
        })
    });
});