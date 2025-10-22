import {HTMLLoader} from "@Services/HTMLLoader";
import {inject, injectable, multiInject} from "inversify";
import {ISiteParser} from "@Services/parsers";
import {INonStandartLexicRepository} from "@IRepository/INonStandartLexicRepository";
import {AppError, ErrorFactory} from "@Essences/Errors";

@injectable()
export class AnekdotPropertiesExtractor {
    constructor(
        @inject("INonStandartLexicRepository")
        private _lexicRepo: INonStandartLexicRepository,
        @multiInject(Symbol.for('ISiteParser'))
        private parsers: ISiteParser[]
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
            throw ErrorFactory.create(AppError, `Парсер для URL ${data} не найден`);
        }

        return createFromText(parser.parse(html));
    };
}