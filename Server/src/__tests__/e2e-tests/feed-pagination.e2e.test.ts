import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { parameter, step } from "allure-js-commons";

describe('Лента анекдотов с пагинацией', () => {
    let httpClient: AxiosInstance;
    let response: AxiosResponse;
    let baseURL: string = 'http://localhost:3000';
    let page: number;
    let limit: number;

    beforeAll(async () => {
        httpClient = axios.create({
            baseURL,
            timeout: 15000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    });

    test('Получение первой страницы ленты', async () => {
        // ARRANGE
        await step('Подготовка параметров запроса', async () => {
            page = 1;
            limit = 5;

            await parameter("page", String(page));
            await parameter("limit", String(limit));
        });

        // ACT
        await step('Выполнение GET запроса к ленте анекдотов', async () => {
            response = await httpClient.get('/api/v1/feed', {
                params: { page: page, limit: limit },
                timeout: 10000
            });
        });

        // ASSERT
        await step('Проверка ответа сервера', async () => {
            expect(response.status).toBe(200);

            if (response.data.anekdots) {
                expect(Array.isArray(response.data.anekdots)).toBe(true);

                response.data.anekdots.forEach((anekdot: any) => {
                    expect(anekdot).toHaveProperty('id');
                    expect(anekdot).toHaveProperty('content');
                    expect(anekdot).toHaveProperty('hasBadWords');
                    expect(anekdot).toHaveProperty('lastModifiedDate');
                });
            }
        });
    }, 30000);
});