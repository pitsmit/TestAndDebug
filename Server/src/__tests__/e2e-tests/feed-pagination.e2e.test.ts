import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { parameter, step } from "allure-js-commons";

describe('Лента анекдотов с пагинацией', () => {
    let httpClient: AxiosInstance;
    let response: AxiosResponse;
    let baseURL: string = 'http://localhost:3000'; // Без /api/v1

    beforeAll(async () => {
        httpClient = axios.create({
            baseURL,
            timeout: 15000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Ждем пока сервер станет доступен
        await waitForServer();
    });

    async function waitForServer(retries = 30, delay = 2000): Promise<void> {
        console.log('⏳ Waiting for server to start...');

        for (let i = 0; i < retries; i++) {
            try {
                // ПРАВИЛЬНЫЙ ПУТЬ: /api/health
                const healthResponse = await httpClient.get('/api/health');
                console.log(`✅ Server is ready! (attempt ${i + 1}/${retries})`);
                console.log('Health check:', healthResponse.data);
                return;
            } catch (error: any) {
                console.log(`⏳ Server not ready yet... (attempt ${i + 1}/${retries})`);
                if (i === retries - 1) {
                    console.error('❌ Server failed to start within expected time');
                    throw new Error(`Server not available after ${retries} attempts: ${error.message}`);
                }
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    test('Получение первой страницы ленты', async () => {
        // ARRANGE
        await step('Подготовка параметров запроса', async () => {
            await parameter("page", "1");
            await parameter("limit", "5");
        });

        // ACT
        await step('Выполнение GET запроса к ленте анекдотов', async () => {
            try {
                console.log('🔄 Sending request to /api/v1/feed...');
                // ПРАВИЛЬНЫЙ ПУТЬ для feed - проверьте в swagger
                response = await httpClient.get('/api/v1/feed', {
                    params: { page: 1, limit: 5 },
                    timeout: 10000
                });
                console.log('✅ Request successful');
                console.log('📊 Response status:', response.status);
                console.log('📊 Response data:', JSON.stringify(response.data, null, 2));
            } catch (error: any) {
                console.error('❌ Request failed:', error.message);
                console.error('Error code:', error.code);
                console.error('Error config:', error.config?.url);
                throw error;
            }
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