import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { parameter, step } from "allure-js-commons";

describe('Лента анекдотов с пагинацией', () => {
    let httpClient: AxiosInstance;
    let response: AxiosResponse;
    let url: string;

    //// в докере запускать отдельно 2 файла(скорее всего это будет два отдельных докер-контейнера)
    //// типо клиент и сервер отдельно, в тестах вообще нигде ни клиент ни сервер быть не должны
    //// вообще это не ввиде теста нужно по хорошему делать??????

    beforeAll(async () => {
        httpClient = axios.create({
            baseURL: 'http://localhost:3000/api',
            timeout: 10000
        });
    });

    test('Получение первой страницы ленты', async () => {
        // ARRANGE
        await step('Подготовка URL запроса', async () => {
            url = '/anekdot/feed?page=1&limit=5';
            await parameter("URL", url);
        });

        // ACT
        await step('Выполнение GET запроса', async () => {
            response = await httpClient.get(url);
        });

        // ASSERT
        await step('Проверка ответа сервера', async () => {
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
        });
    });

    test('Содержимое анекдотов корректно', async () => {
        // ARRANGE
        await step('Подготовка URL запроса', async () => {
            url = '/anekdot/feed';
            await parameter("URL", url);
        });

        // ACT
        await step('Выполнение GET запроса', async () => {
            response = await httpClient.get(url);
        });

        // ASSERT
        await step('Проверка содержимого анекдотов', async () => {
            const anekdots = response.data.anekdots;
            const contents = anekdots.map((a: any) => a.content);

            expect(contents).toContain('Test joke content 1');
            expect(contents).toContain('Test joke content 2');
            expect(contents).toContain('Test joke content 3');
        });
    });

    test('Пустая страница при несуществующей пагинации', async () => {
        // ARRANGE
        await step('Подготовка URL запроса с несуществующей страницей', async () => {
            url = '/anekdot/feed?page=999&limit=10';
            await parameter("URL", url);
        });

        // ACT
        await step('Выполнение GET запроса', async () => {
            response = await httpClient.get(url);
        });

        // ASSERT
        await step('Проверка пустого результата', async () => {
            expect(response.data.success).toBe(true);
            expect(response.data.anekdots).toHaveLength(0);
            expect(response.data.pagination.page).toBe(999);
        });
    });
});