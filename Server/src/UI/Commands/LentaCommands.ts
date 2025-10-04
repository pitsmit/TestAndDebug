import {Command} from "@UICommands/BaseCommand";
import {Anekdot} from "@Core/Essences/anekdot";
import {logger} from "@Core/Services/logger";

export class ShowLentaCommand extends Command {
    public _anekdots: Anekdot[];
    public _page: number;
    public _limit: number;

    constructor(page: number, limit: number) {
        super();
        this._page = page;
        this._limit = limit;
        this._anekdots = [];
    }

    async execute() : Promise<void> {
        this._anekdots = await this._LentaManager.ShowLenta(this._page, this._limit);
        logger.info("показ ленты");
    }
}
