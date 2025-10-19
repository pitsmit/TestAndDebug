import {Command} from "@Commands/BaseCommand";
import {Anekdot} from "@Core/Essences/anekdot";
import {logger} from "@Core/Services/logger";

export class UserManagerCommand extends Command {
    constructor(protected readonly _token: string) {
        super();
    }
}

export class AddToFavouritesCommand extends UserManagerCommand {
    anekdot!: Anekdot;

    constructor(token: string, private readonly _anekdot_id: number) {
        super(token);
    }
    async execute() : Promise<void> {
        this.anekdot = await this._UserManager.AddToFavourites(this._token, this._anekdot_id);
        logger.info('Добавление анекдота в избранное');
    }
}

export class DeleteFromFavouritesCommand extends UserManagerCommand {
    constructor(token: string, private readonly _anekdot_id: number) {
        super(token);
    }
    async execute() : Promise<void> {
        await this._UserManager.DeleteFromFavourites(this._token, this._anekdot_id);
        logger.info('Удаление анекдота из избранного');
    }
}

export class ShowFavouritesCommand extends UserManagerCommand {
    _anekdots: Anekdot[] = [];

    constructor(token: string, private readonly _page: number, private readonly _limit: number) {
        super(token);
    }
    async execute() : Promise<void> {
        this._anekdots = await this._UserManager.ShowFavourites(this._token, this._page, this._limit);
        logger.info('Показ ленты избранного');
    }
}