import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { parameter, step } from "allure-js-commons";

describe('Лента анекдотов с пагинацией', () => {
    let httpClient: AxiosInstance;
    let response: AxiosResponse;
    let baseURL: string = 'http://localhost:3000/api/v1';

    beforeAll(async () => {
        httpClient = axios.create({
            baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    });

    test('Получение первой страницы ленты', async () => {
        // ARRANGE
        await step('Подготовка параметров запроса', async () => {
            await parameter("page", "1");
            await parameter("limit", "5");
        });

        // ACT
        await step('Выполнение GET запроса к ленте анекдотов', async () => {
            console.log("SOSAL");
            try {
                response = await httpClient.get('/feed', {
                    params: { page: 1, limit: 5 }
                });
                console.log('📊 Response status:', response.status);
                console.log('📊 Response data:', JSON.stringify(response.data, null, 2));
            } catch (error: any) {
                console.error('❌ Request failed:', error.message);
                if (error.response) {
                    console.error('Response data:', error.response.data);
                    console.error('Response status:', error.response.status);
                }
                throw error;
            }
        });

        // ASSERT
        await step('Проверка ответа сервера', async () => {
            expect(response.status).toBe(200);
            expect(response.data).toHaveLength(5);

            response.data.forEach((anekdot: any) => {
                expect(anekdot).toHaveProperty('id');
                expect(anekdot).toHaveProperty('text');
                expect(anekdot).toHaveProperty('hasBadWords');
                expect(anekdot).toHaveProperty('lastModifiedDate');
                expect(anekdot.text).toMatch(/Test joke content/);
            });
        });
    });
});