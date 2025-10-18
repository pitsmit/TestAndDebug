import {HTMLLoader} from "@Services/HTMLLoader";
import {inject, injectable, multiInject} from "inversify";
import {ISiteParser} from "@Services/parsers";
import {logger} from "@Services/logger";
import {INonStandartLexicRepository} from "@IRepository/INonStandartLexicRepository";

@injectable()
export class AnekdotPropertiesExtractor {
    constructor(
        @inject("INonStandartLexicRepository")
        private _lexicRepo: INonStandartLexicRepository,
        @multiInject(Symbol.for('ISiteParser'))
        private parsers: ISiteParser[] = []
    ) {}

    private async createFromText(text: string): Promise<{ text: string, hasBadWords: boolean, lastModifiedDate: Date }> {
        const hasBadWords: boolean = await this._lexicRepo.containsBadWords(text);
        const lastModifiedDate: Date = new Date();
        return {text, hasBadWords, lastModifiedDate};
    }

    private async createFromUrl(url: string): Promise<{ text: string, hasBadWords: boolean, lastModifiedDate: Date }> {
        const html = await new HTMLLoader().getHTML(url);
        const parser = this.parsers.find(p => url.includes(p.url));

        if (!parser) {
            const msg: string = `Парсер для URL ${url} не найден`;
            logger.warn(msg);
            throw new Error(msg);
        }

        return this.createFromText(parser.parse(html));
    }

    async extract(data: string): Promise<{ text: string, hasBadWords: boolean, lastModifiedDate: Date }> {
        try {
            new URL(data);
            return await this.createFromUrl(data);
        } catch {
            return await this.createFromText(data);
        }
    }
}