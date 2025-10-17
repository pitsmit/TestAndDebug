import {HTMLLoader} from "@Services/HTMLLoader";
import {Anekdot} from "@Core/Essences/anekdot";
import {inject, injectable, multiInject} from "inversify";
import {ISiteParser} from "@Services/parsers";
import {logger} from "@Services/logger";
import {INonStandartLexicRepository} from "@IRepository/INonStandartLexicRepository";

@injectable()
export class AnekdotFactory {
    constructor(
        @inject("INonStandartLexicRepository")
        private _lexicRepo: INonStandartLexicRepository,
        @multiInject(Symbol.for('ISiteParser'))
        private parsers: ISiteParser[] = []
    ) {}

    private async createFromText(text: string): Promise<Anekdot> {
        return new Anekdot(text, await this._lexicRepo.containsBadWords(text));
    }

    private async createFromUrl(url: string): Promise<Anekdot> {
        const html = await new HTMLLoader().getHTML(url);
        const parser = this.parsers.find(p => url.includes(p.url));

        if (!parser) {
            const msg: string = `Парсер для URL ${url} не найден`;
            logger.warn(msg);
            throw new Error(msg);
        }

        return this.createFromText(parser.parse(html));
    }

    async create(data: string): Promise<Anekdot> {
        try {
            new URL(data);
            return await this.createFromUrl(data);
        } catch {
            return await this.createFromText(data);
        }
    }
}