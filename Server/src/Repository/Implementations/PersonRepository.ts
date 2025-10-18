import {IDBconnection} from "@IRepository/IDBconnection";
import {PoolClient, QueryResult} from "pg";
import {inject} from "inversify";
import {logger} from "@Core/Services/logger";
import {IPersonRepository} from "@IRepository/IPersonRepository";
import {BusyCredentialsError, CredentialsError, CredentialsFormatError} from "@Essences/Errors";

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
            throw new CredentialsError();
        }

        const msg = `Пользователь с логином ${login} не найден`;
        logger.error(msg);
        throw new CredentialsError();
    }

    async create(login: string, password: string, name: string, role: number): Promise<number> {
        let client: PoolClient = await this.DB.connect();

        try {
            const insertQuery = `INSERT INTO actor (login, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id`;
            const result = await client.query(insertQuery, [login, password, name, role]);

            return result.rows[0].id;
        } catch (error) {
            throw new BusyCredentialsError();
        } finally {
            client.release();
        }
    }
}