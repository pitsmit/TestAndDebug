import {Command} from "@UICommands/BaseCommand";
import {Person} from "@Core/Essences/person";
import {Anekdot} from "@Core/Essences/anekdot";
import {logger} from "@Core/Services/logger";

export class UserManagerCommand extends Command {
    protected readonly _user: Person;

    constructor(user: Person) {
        super();
        this._user = user;
    }
}

export class AddToFavouritesCommand extends UserManagerCommand {
    protected readonly _anekdot_id: number;

    constructor(user: Person, id: number) {
        super(user);
        this._anekdot_id = id;
    }

    async execute() : Promise<void> {
        await this._UserManager.AddToFavourites(this._user, this._anekdot_id);
        logger.info('Добавление анекдота в избранное');
    }
}

export class DeleteFromFavouritesCommand extends UserManagerCommand {
    protected readonly _anekdot_id: number;

    constructor(user: Person, id: number) {
        super(user);
        this._anekdot_id = id;
    }

    async execute() : Promise<void> {
        await this._UserManager.DeleteFromFavourites(this._user, this._anekdot_id);
        logger.info('Удаление анекдота из избранного');
    }
}

export class ShowFavouritesCommand extends UserManagerCommand {
    public _anekdots!: Anekdot[];
    public _page: number;
    public _limit: number;

    constructor(user: Person, page: number, limit: number) {
        super(user);
        this._page = page;
        this._limit = limit;
    }

    async execute() : Promise<void> {
        this._anekdots = await this._UserManager.ShowFavourites(this._user, this._page, this._limit);
        logger.info('Показ ленты избранного');
    }
}