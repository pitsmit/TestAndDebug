import {AnekdotBuilder} from "@Core/Services/anekdotbuilder";
import {SiteAnekdotBuilder} from "@Core/Services/siteanekdotbuilder";
import {Anekdot} from "@Core/Essences/anekdot";
import {inject, injectable} from "inversify";

export abstract class IAnekdotDirector {
    public abstract create(src: string): Promise<Anekdot>;
    public abstract canHandle(data: string): boolean;
}

@injectable()
export class TextAnekdotDirector extends IAnekdotDirector {
    constructor(@inject(AnekdotBuilder) private _builder: AnekdotBuilder) {
        super();
    }

    public canHandle(data: string): boolean {
        try {
            new URL(data);
            return false;
        } catch {
            return true;
        }
    }

    public async create(text: string): Promise<Anekdot> {
        return await this._builder.build(text);
    }
}

@injectable()
export class SiteAnekdotDirector extends IAnekdotDirector {
    constructor(@inject(SiteAnekdotBuilder) private _parser: SiteAnekdotBuilder,
                @inject(AnekdotBuilder) private _builder: AnekdotBuilder) {
        super();
    }

    public canHandle(data: string): boolean {
        try {
            new URL(data);
            return true;
        } catch {
            return false;
        }
    }

    public async create(link: string): Promise<Anekdot> {
        const html: string = await this._parser.getHTML(link);
        const parser = this._parser.getParser(link);
        return await this._builder.build(parser.parse(html));
    }
}