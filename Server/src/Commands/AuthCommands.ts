import {Command} from "@Commands/BaseCommand";
import {Person} from "@Core/Essences/person";
import {logger} from "@Core/Services/logger";

export class AuthCommand extends Command {
    person!: Person;

    constructor(protected readonly _login: string, protected readonly _password: string) {
        super();
    }
}

export class EntryCommand extends AuthCommand {
    constructor(login: string, password: string) {
        super(login, password);
    }
    async execute(): Promise<void> {
        this.person = await this._PersonFabric.get(this._login, this._password);
        logger.info("Пользователь вошёл");
    }
}

export class RegistrateCommand extends AuthCommand{
    constructor(login: string, password: string, protected _name: string, protected _role: number) {
        super(login, password);
    }
    async execute(): Promise<void> {
        this.person = await this._PersonFabric.create(this._login, this._password, this._name, this._role);
        logger.info("Регистрация успешна");
    }
}