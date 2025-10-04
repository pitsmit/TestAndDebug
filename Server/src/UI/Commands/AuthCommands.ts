import {Command} from "@UICommands/BaseCommand";
import {Person} from "@Core/Essences/person";
import {logger} from "@Core/Services/logger";

export class EntryPersonCommand extends Command {
    protected _person!: Person;
    protected _login: string;
    protected _password: string;

    constructor(login: string, pass: string) {
        super();
        this._login = login;
        this._password = pass;
    }

    get person (): Person {
        return this._person;
    }

    async execute(): Promise<void> {
        this._person = await this._PersonFabric.get(this._login, this._password);
        logger.info("Пользователь вошёл");
    }
}

export class RegistratePersonCommand extends Command{
    protected _person!: Person;
    protected _login: string;
    protected _password: string;
    protected _name: string;
    protected _role: number;

    constructor(login: string, password: string, name: string, role: number) {
        super();
        this._login = login;
        this._password = password;
        this._name = name;
        this._role = role;
    }

    get person (): Person {
        return this._person;
    }

    async execute(): Promise<void> {
        this._person = await this._PersonFabric.create(this._login, this._password, this._name, this._role);
        logger.info("Регистрация успешна");
    }
}