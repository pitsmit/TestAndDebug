import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { parameter, step } from "allure-js-commons";

describe('Авторизация админа и добавление админом анекдота', () => {
    let httpClient: AxiosInstance;
    let response: AxiosResponse;
    let baseURL: string = 'http://localhost:3000';
    let login: string;
    let password: string;
    let token: string;
    let anekdotData: any;
    let authenticatedClient: AxiosInstance;

    beforeAll(async () => {
        httpClient = axios.create({
            baseURL,
            timeout: 15000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    });

    test('hhh', async () => {
        // ARRANGE
        await step('Подготовка параметров запроса для входа', async () => {
            login = 'tesuser';
            password = 'hashpaword';

            await parameter("login", login);
            await parameter("password", password);
        });

        // ACT
        await step('Выполнение POST запроса авторизации', async () => {
            response = await httpClient.post('/api/v1/login', { login, password });
        });

        // ASSERT
        await step('Проверка ответа сервера', async () => {
            expect(response.status).toBe(200);
            expect(response.data.payload.user.name).toEqual('TestUser');
            expect(response.data.payload.user.role).toEqual(1);

            token = response.data.payload.user.token;
        });

        // ARRANGE
        await step('Подготовка параметров запроса для загрузки анекдота', async () => {
            authenticatedClient = axios.create({
                baseURL,
                timeout: 15000,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            anekdotData = {
                text: "Текст добавляемого анекдота",
            };
        });

        // ACT
        await step('Выполнение POST запроса добавления анекдота', async () => {
            response = await authenticatedClient.post('/api/v1/anekdots', anekdotData);
        });

        // ASSERT
        await step('Проверка ответа сервера', async () => {
            expect(response.status).toBe(201);
            expect(response.data.payload.text).toEqual(anekdotData.text);
        });
    }, 30000);
});