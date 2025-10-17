import {Command} from "@UICommands/BaseCommand";
import {Anekdot} from "@Core/Essences/anekdot";
import {logger} from "@Core/Services/logger";

export class ShowLentaCommand extends Command {
    public _anekdots: Anekdot[] = [];

    constructor(private readonly _page: number, private readonly _limit: number) {
        super();
    }
    async execute() : Promise<void> {
        this._anekdots = await this._LentaManager.ShowLenta(this._page, this._limit);
        logger.info("показ ленты");
    }
}
