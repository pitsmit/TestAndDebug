import {injectable} from "inversify";
import * as cheerio from 'cheerio';
import {logger} from "@Core/Services/logger";

export abstract class ISiteParser {
    protected constructor(protected readonly selector: string,
                          public readonly url: string) {}

    parse(data: string): string {
        const $ = cheerio.load(data);
        const anekdot = $(this.selector);

        if (!anekdot.length) {
            const msg: string = `Не найдена структура анекдота на странице`;
            logger.warn(msg);
            throw new Error(msg);
        }

        return anekdot.text().replace(/\n/g, ' ').trim();
    }
}

@injectable()
export class AnekdotRuParser extends ISiteParser {
    constructor() {
        super('div.a_id_item[data-t="j"] div.text', 'anekdot.ru');
    }
}

@injectable()
export class AnekdotovStreetParser extends ISiteParser {
    constructor() {
        super('div.anekdot-text > p', 'anekdotovstreet.com');
    }
}