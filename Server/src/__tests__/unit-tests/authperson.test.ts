import 'reflect-metadata';
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import {step, parameter} from "allure-js-commons";
import {AuthDataMother} from "@/__tests__/helpers/AuthDataMother";
import { container } from "@Facade/container";
import { mockDBConnection, mockClient } from "../mocks/DBmocks";
import { Person } from "@Essences/person";
import { PersonRepository } from "@Repository/PersonRepository";
import {SQLBuilder} from "@/__tests__/helpers/SQLBuilder";
import {IPersonRepository} from "@IRepository/IPersonRepository";

describe('Вход и регистрация пользователя', () => {
    let userData: {login: string, password: string, name: string, role: number};
    let personrepository: IPersonRepository;
    let token: string = "test_token";
    let authmother: AuthDataMother = new AuthDataMother();
    let sqlbuilder: SQLBuilder;

    beforeEach(() => {
        process.env.JWT_SECRET = 'test_jwt_secret_for_testing';
        container.unbindAll();

        mockClient.query.mockClear();

        container.bind("IPersonRepository").to(PersonRepository);
        container.bind("IDBconnection").toConstantValue(mockDBConnection);

        personrepository = container.get<IPersonRepository>("IPersonRepository");

        sqlbuilder = new SQLBuilder();
    });

    afterEach(() => {
        container.unbindAll();
        delete process.env.JWT_SECRET;
    });

    test('Успешный вход', async () => {
        let person: Person;

        /// ARRANGE
        await step('Подготовка тестовых данных', async () => {
            userData = authmother.CreateValidUserData();
            const selectResult = sqlbuilder
                .withRows([{password: userData.password, name: userData.name, role: userData.role}])
                .create();

            console.log(selectResult);

            mockClient.query
                .mockResolvedValueOnce(selectResult);

            await parameter("login", userData.login);
            await parameter("password", userData.password);
            await parameter("token", token);
        });

        /// ACT
        await step('Выполнение команды входа', async () => {
            person = await personrepository.get(userData.login, userData.password, token);
        });

        /// ASSERT
        await step('Проверка данных пользователя', () => {
            expect(person).toMatchObject({
                login: userData.login,
                name: userData.name,
                role: userData.role
            });
            expect(person.token).toEqual(token);
        });

        await step('Проверка выполненных SQL запросов', () => {
            expect(mockClient.query).toHaveBeenCalledTimes(1);
            expect(mockClient.query).toHaveBeenNthCalledWith(
                1,
                `SELECT * FROM actor WHERE login = $1`,
                [userData.login]
            );
        });
    });

    test('Вход с неверным паролем', async () => {
        let ErrorMessage: string;
        let resultPromise: Promise<Person>;

        /// ARRANGE
        await step('Подготовка тестовых данных', async () => {
            const wrongpass: string = "wrongpassword";
            userData = authmother.CreateValidUserData();
            const selectResult = sqlbuilder
                .withRows([{password: wrongpass, name: userData.name, role: userData.role}])
                .create()

            mockClient.query
                .mockResolvedValueOnce(selectResult);
            ErrorMessage = `Неверный пароль`;

            await parameter("login", userData.login);
            await parameter("Введённый пароль", userData.password);
            await parameter("Пароль из БД", wrongpass);
            await parameter("token", token);
            await parameter("Текст ошибки", ErrorMessage);
        });

        /// ACT
        await step('Выполнение команды входа', async () => {
            resultPromise = personrepository.get(userData.login, userData.password, token);
        });

        /// ASSERT
        await step('Проверка ошибки неверного пароля', async () => {
            await expect(resultPromise).rejects.toThrow(ErrorMessage);
        });

        await step('Проверка выполненных SQL запросов', () => {
            expect(mockClient.query).toHaveBeenCalledTimes(1);
            expect(mockClient.query).toHaveBeenNthCalledWith(
                1,
                `SELECT * FROM actor WHERE login = $1`,
                [userData.login]
            );
        });
    });

    test('Вход с неверным логином', async () => {
        let userData: {login: string, password: string, name: string, role: number};
        let ErrorMessage: string;
        let resultPromise: Promise<Person>;

        /// ARRANGE
        await step('Подготовка тестовых данных', async () => {
            userData = authmother.CreateValidUserData();
            const selectResult = sqlbuilder
                .withRowCount(0)
                .withType('SELECT')
                .withRows([])
                .create();

            mockClient.query
                .mockResolvedValueOnce(selectResult);
            ErrorMessage = `Пользователь с логином ${userData.login} не найден`;

            await parameter("login", userData.login);
            await parameter("password", userData.password);
            await parameter("Текст ошибки", ErrorMessage);
            await parameter("token", token);
        });

        /// ACT
        await step('Выполнение команды входа', async () => {
            resultPromise = personrepository.get(userData.login, userData.password, token);
        });

        /// ASSERT
        await step('Проверка ошибки неверного логина', async () => {
            await expect(resultPromise).rejects.toThrow(ErrorMessage);
        });

        await step('Проверка выполненных SQL запросов', () => {
            expect(mockClient.query).toHaveBeenCalledTimes(1);
            expect(mockClient.query).toHaveBeenNthCalledWith(
                1,
                `SELECT * FROM actor WHERE login = $1`,
                [userData.login]
            );
        });
    });

    test('Успешная регистрация', async () => {
        let result: Person;

        /// ARRANGE
        await step('Подготовка тестовых данных', async () => {
            const emptyResult = sqlbuilder
                .withRowCount(0)
                .withType('SELECT')
                .withRows([])
                .create();

            const insertResult = sqlbuilder
                .withRowCount(1)
                .withType('INSERT')
                .withRows([])
                .create();


            mockClient.query
                .mockResolvedValueOnce(emptyResult)
                .mockResolvedValueOnce(insertResult);

            userData = authmother.CreateValidUserData();

            await parameter("login", userData.login);
            await parameter("password", userData.password);
            await parameter("name", userData.name);
            await parameter("role", String(userData.role));
        });

        /// ACT
        await step('Выполнение команды регистрации', async () => {
            result = await personrepository.create(userData.login, userData.password, userData.name, token, userData.role);
        });

        /// ASSERT
        await step('Проверка данных пользователя', () => {
            expect(result).toMatchObject({
                login: userData.login,
                name: userData.name,
                role: userData.role
            });
        });

        await step('Проверка выполненных SQL запросов', () => {
            expect(mockClient.query).toHaveBeenCalledTimes(2);
            expect(mockClient.query).toHaveBeenNthCalledWith(
                1,
                `SELECT login FROM actor WHERE login = $1`,
                [userData.login]
            );
            expect(mockClient.query).toHaveBeenNthCalledWith(
                2,
                `INSERT INTO actor (login, password, name, role) VALUES ($1, $2, $3, $4)`,
                [userData.login, userData.password, userData.name, userData.role]
            );
        });
    });
});