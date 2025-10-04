import {injectable, multiInject} from 'inversify';
import axios from 'axios';
import {ISiteParser} from "@Core/Services/parsers";
import {logger} from "@Core/Services/logger";

@injectable()
export class SiteAnekdotBuilder {
    private parsers: ISiteParser[];

    constructor(
        @multiInject(Symbol.for('ISiteParser')) parsers: ISiteParser[]) {
        this.parsers = parsers;
    }

    async getHTML(url: string): Promise<string> {
        const source = axios.CancelToken.source();
        const timeout = setTimeout(() => source.cancel('Timeout'), 5000);

        try {
            return (await axios.get(url, {
                cancelToken: source.token,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
                }
            })).data;
        } catch (error: any) {
            source.cancel('Request failed');
            logger.error(error.message);
            throw error;
        } finally {
            clearTimeout(timeout);
        }
    }

    getParser(url: string): ISiteParser {
        const parser: ISiteParser | undefined = this.parsers.find(p => url.includes(p.url));

        if (!parser) {
            const msg: string = `Парсер для URL ${url} не найден`;
            logger.warn(msg);
            throw new Error(msg);
        }

        return parser;
    }
}