import {Person} from "@Core/Essences/person";
import {IDBconnection} from "@IRepository/IDBconnection";
import {PoolClient, QueryResult} from "pg";
import {inject} from "inversify";
import {logger} from "@Core/Services/logger";
import {IPersonRepository} from "@IRepository/IPersonRepository";

export class PersonRepository implements IPersonRepository {
    constructor(
        @inject("IDBconnection") private DB: IDBconnection,
    ) {}

    async get(login: string, password: string, token: string): Promise<Person> {
        let client: PoolClient = await this.DB.connect();

        let result: QueryResult;

        try {
            const query = `SELECT * FROM actor WHERE login = $1`
            result = await client.query(query, [login]);
        } finally {
            client.release();
        }

        if (result.rowCount) {
            const person: any = result.rows[0];
            if (person.password === password) {
                return new Person(token, login, person.name, person.role);
            }
            const msg = `Неверный пароль`;
            logger.error(msg);
            throw new Error(msg);
        }

        const msg = `Пользователь с логином ${login} не найден`;
        logger.error(msg);
        throw new Error(msg);
    }

    async create(login: string, password: string, name: string, token: string, role: number): Promise<Person> {
        let client: PoolClient = await this.DB.connect();

        try {
            const checkResult: QueryResult = await client.query(
                `SELECT login FROM actor WHERE login = $1`,
                [login]
            );

            if (checkResult.rowCount && checkResult.rowCount > 0) {
                const msg: string = `Логин ${login} занят`;
                logger.warn(msg);
                throw new Error(msg);
            }

            const insertQuery = `INSERT INTO actor (login, password, name, role) VALUES ($1, $2, $3, $4)`;
            await client.query(insertQuery, [login, password, name, role]);

            return new Person(token, login, name, role);
        } finally {
            client.release();
        }
    }
}