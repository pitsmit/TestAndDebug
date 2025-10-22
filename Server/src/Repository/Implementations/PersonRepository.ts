import {IDBconnection} from "@IRepository/IDBconnection";
import {PoolClient, QueryResult} from "pg";
import {inject} from "inversify";
import {IPersonRepository} from "@IRepository/IPersonRepository";
import {
    BusyCredentialsError,
    CredentialsError,
    CredentialsFormatError, ErrorFactory
} from "@Essences/Errors";

export class PersonRepository implements IPersonRepository {
    constructor(
        @inject("IDBconnection") private DB: IDBconnection,
    ) {}


    private isValidTextField(data: string): boolean {
        return data.length >= 1 &&
            data.length <= 10 &&
            /^[A-Za-z0-9]+$/.test(data);
    }

    async get(login: string, password: string): Promise<{role: number, id: number, name: string}> {
        if (!(this.isValidTextField(login) && this.isValidTextField(password))) {
            throw ErrorFactory.create(CredentialsFormatError);
        }

        let client: PoolClient = await this.DB.connect();
        let result: QueryResult;

        try {
            result = await client.query(`SELECT * FROM actor WHERE login = $1`, [login]);
        } finally {
            client.release();
        }

        if (result.rowCount) {
            const person: any = result.rows[0];
            if (person.password === password) {
                return {role: person.role, id: person.id, name: person.name};
            }
            throw ErrorFactory.create(CredentialsError, `Неверный пароль`);
        }

        throw ErrorFactory.create(CredentialsError, `Пользователь с логином ${login} не найден`);
    }

    async create(login: string, password: string, name: string, role: number): Promise<number> {
        if (!(this.isValidTextField(login) &&
              this.isValidTextField(password) &&
              this.isValidTextField(name)) || role > 1 || role < 0
        ) {
            throw ErrorFactory.create(CredentialsFormatError);
        }

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
                throw ErrorFactory.create(BusyCredentialsError, `Логин "${login}" и имя "${name}" уже заняты`);
            } else if (login_exists) {
                await client.query('ROLLBACK');
                throw ErrorFactory.create(BusyCredentialsError, `Логин "${login}" уже занят`);
            } else if (name_exists) {
                await client.query('ROLLBACK');
                throw ErrorFactory.create(BusyCredentialsError, `Имя "${name}" уже занято`);
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