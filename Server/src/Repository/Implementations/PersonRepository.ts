import {IDBconnection} from "@IRepository/IDBconnection";
import {PoolClient, QueryResult} from "pg";
import {inject} from "inversify";
import {logger} from "@Core/Services/logger";
import {IPersonRepository} from "@IRepository/IPersonRepository";
import {
    BusyCredentialsError,
    BusyLoginError,
    BusyNameError,
    CredentialsError,
    CredentialsFormatError
} from "@Essences/Errors";

export class PersonRepository implements IPersonRepository {
    constructor(
        @inject("IDBconnection") private DB: IDBconnection,
    ) {}

    async get(login: string, password: string): Promise<{role: number, id: number, name: string}> {
        let client: PoolClient = await this.DB.connect();

        let result: QueryResult;

        try {
            const query = `SELECT * FROM actor WHERE login = $1`
            result = await client.query(query, [login]);
        } catch (error) {
            throw new CredentialsFormatError();
        }
        finally {
            client.release();
        }

        if (result.rowCount) {
            const person: any = result.rows[0];
            if (person.password === password) {
                return {role: person.role, id: person.id, name: person.name};
            }
            const msg = `Неверный пароль`;
            logger.error(msg);
            throw new CredentialsError(msg);
        }

        const msg = `Пользователь с логином ${login} не найден`;
        logger.error(msg);
        throw new CredentialsError(msg);
    }

    async create(login: string, password: string, name: string, role: number): Promise<number> {
        let client: PoolClient = await this.DB.connect();

        try {
            await client.query('BEGIN');

            const checkQuery = `
                SELECT
                    EXISTS(SELECT 1 FROM actor WHERE login = $1) as login_exists,
                    EXISTS(SELECT 1 FROM actor WHERE name = $2) as name_exists`;
            const checkResult = await client.query(checkQuery, [login, name]);
            const { login_exists, name_exists } = checkResult.rows[0];

            if (login_exists && name_exists) {
                await client.query('ROLLBACK');
                throw new BusyCredentialsError(`Логин "${login}" и имя "${name}" уже заняты`);
            } else if (login_exists) {
                await client.query('ROLLBACK');
                throw new BusyLoginError(`Логин "${login}" уже занят`);
            } else if (name_exists) {
                await client.query('ROLLBACK');
                throw new BusyNameError(`Имя "${name}" уже занято`);
            }

            const insertQuery = `INSERT INTO actor (login, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id`;
            const result = await client.query(insertQuery, [login, password, name, role]);

            await client.query('COMMIT');
            return result.rows[0].id;
        } finally {
            client.release();
        }
    }
}