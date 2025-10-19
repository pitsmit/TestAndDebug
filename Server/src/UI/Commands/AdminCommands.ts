import {Command} from "@UICommands/BaseCommand";
import {logger} from "@Core/Services/logger";
import {Anekdot} from "@Essences/anekdot";

export class AdminCommand extends Command {
    constructor(protected readonly _token: string) {
        super();
    }
}

export class LoadAnekdotCommand extends AdminCommand {
    anekdot!: Anekdot;

    constructor(token: string, private readonly _data: string) {
        super(token);
    }
    async execute() : Promise<void> {
        this.anekdot = await this._AdminManager.LoadAnekdot(this._token, this._data);
        logger.info('Загрузка анекдота');
    }
}

export class DeleteAnekdotCommand extends AdminCommand {
    constructor(token: string, private readonly _id: number) {
        super(token);
    }
    async execute() : Promise<void> {
        await this._AdminManager.DeleteAnekdot(this._token, this._id);
        logger.info('Удаление анекдота');
    }
}

export class EditAnekdotCommand extends AdminCommand {
    anekdot!: Anekdot;

    constructor(token: string, private readonly _id: number, private readonly _new_text: string) {
        super(token);
    }
    async execute() : Promise<void> {
        this.anekdot = await this._AdminManager.EditAnekdot(this._token, this._id, this._new_text);
        logger.info('Редактирование анекдота');
    }
}