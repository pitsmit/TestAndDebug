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

    extract = async (data: string) => {
        const createFromText = async (text: string) => ({
            text,
            hasBadWords: await this._lexicRepo.containsBadWords(text),
            lastModifiedDate: new Date()
        });

        if (!URL.canParse(data)) return createFromText(data);

        const html = await new HTMLLoader().getHTML(data);
        const parser = this.parsers.find(p => data.includes(p.url));

        if (!parser) {
            const msg: string = `Парсер для URL ${data} не найден`;
            logger.warn(msg);
            throw new Error(msg);
        }

        return createFromText(parser.parse(html));
    };
}