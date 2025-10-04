import {Command} from "@UICommands/BaseCommand";
import {Person} from "@Core/Essences/person";
import {logger} from "@Core/Services/logger";

export class AdminCommand extends Command {
    protected readonly _admin: Person;

    constructor(admin: Person) {
        super();
        this._admin = admin;
    }
}

export class LoadAnekdotCommand extends AdminCommand {
    private readonly _data: string;

    constructor(person: Person, data: string) {
        super(person);
        this._data = data;
    }

    async execute() : Promise<void> {
        await this._AdminManager.LoadAnekdot(this._admin, this._data);
        logger.info('Загрузка анекдота');
    }
}

export class DeleteAnekdotCommand extends AdminCommand {
    private readonly _id: number;

    constructor(person: Person, id: number) {
        super(person);
        this._id = id;
    }
    async execute() : Promise<void> {
        await this._AdminManager.DeleteAnekdot(this._admin, this._id);
        logger.info('Удаление анекдота');
    }
}

export class EditAnekdotCommand extends AdminCommand {
    private readonly _id: number;
    private readonly _new_text: string;

    constructor(person: Person, id: number, new_text: string) {
        super(person);
        this._id = id;
        this._new_text = new_text;
    }
    async execute() : Promise<void> {
        await this._AdminManager.EditAnekdot(this._admin, this._id, this._new_text);
        logger.info('Редактирование анекдота');
    }
}