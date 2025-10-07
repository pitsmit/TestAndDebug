import { ApiServer } from '@/api-server';
import { TestDBHelper } from "../helpers/DBTestHelper";
import { container } from "@Facade/container";
import { IDBconnection } from "@IRepository/IDBconnection";
import axios, {AxiosInstance, AxiosResponse} from 'axios';
import {IDBConfigProvider} from "@IRepository/IDBConfigProvider";
import {TestDBConfigProvider} from "@/__tests__/helpers/TestDBConfigProvider";
import {DBconnection} from "@Repository/DBconnection";
import {parameter, step} from "allure-js-commons";

describe('Лента анекдотов с пагинацией', () => {
    let apiServer: ApiServer;
    let httpClient: AxiosInstance;
    let testDBHelper: TestDBHelper;
    let dbConnection: IDBconnection;
    let response: AxiosResponse;
    let url: string;

    beforeAll(async () => {
        testDBHelper = new TestDBHelper();
        await testDBHelper.ensureTestDatabase();

        await container.unbind("IDBConfigProvider");
        await container.unbind("IDBconnection");
        container.bind<IDBConfigProvider>("IDBConfigProvider").to(TestDBConfigProvider).inSingletonScope();
        container.bind<IDBconnection>("IDBconnection").to(DBconnection).inSingletonScope();

        dbConnection = container.get<IDBconnection>("IDBconnection");

        apiServer = new ApiServer(3000);
        await apiServer.start();

        httpClient = axios.create({
            baseURL: 'http://localhost:3000/api',
            timeout: 10000
        });

        await testDBHelper.cleanTestDB(dbConnection);
        await testDBHelper.fillTestDB(dbConnection);
    });

    afterAll(async () => {
        await testDBHelper.cleanTestDB(dbConnection);
        await apiServer.stop();

        if (dbConnection && dbConnection.pool) {
            await dbConnection.pool.end();
        }
    });

    test('Получение первой страницы ленты', async () => {
        // ARRANGE
        await step('Подготовка тестовых данных', async () => {
            url = '/anekdot/feed?page=1&limit=5';

            await parameter("URL", url);
        })

        // ACT
        await step('Выполнение запроса', async () => {
            response = await httpClient.get(url);
        })

        // ASSERT
        await step('Проверка', async () => {
            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(response.data.anekdots).toHaveLength(3);
            expect(response.data.pagination).toEqual({
                page: 1,
                limit: 5,
                total: 3
            });

            response.data.anekdots.forEach((anekdot: any) => {
                expect(anekdot).toHaveProperty('id');
                expect(anekdot).toHaveProperty('content');
                expect(anekdot).toHaveProperty('hasBadWords');
                expect(anekdot).toHaveProperty('lastModifiedDate');
            });
        })
    });

    test('Содержимое анекдотов корректно', async () => {
        // ARRANGE
        await step('Подготовка тестовых данных', async () => {
            url = '/anekdot/feed';

            await parameter("URL", url);
        })

        // ACT
        await step('Выполнение запроса', async () => {
            response = await httpClient.get(url);
        })

        // ASSERT
        await step('Проверка', async () => {
            const anekdots = response.data.anekdots;

            const contents = anekdots.map((a: any) => a.content);
            expect(contents).toContain('Test joke content 1');
            expect(contents).toContain('Test joke content 2');
            expect(contents).toContain('Test joke content 3');
        })
    });

    test('Пустая страница при несуществующей пагинации', async () => {
        // ARRANGE
        await step('Подготовка тестовых данных', async () => {
            url = '/anekdot/feed?page=999&limit=10';

            await parameter("URL", url);
        })

        // ACT
        await step('Выполнение запроса', async () => {
            response = await httpClient.get(url);
        })

        // ASSERT
        await step('Проверка', async () => {
            expect(response.data.success).toBe(true);
            expect(response.data.anekdots).toHaveLength(0);
            expect(response.data.pagination.page).toBe(999);
        })
    });
});