import {Anekdot} from "@Core/Essences/anekdot";
import {INonStandartLexicRepository} from "@IRepository/INonStandartLexicRepository";
import {inject, injectable} from "inversify";

@injectable()
export class AnekdotBuilder {
    constructor(
        @inject("INonStandartLexicRepository") private _nonstdlexicrep: INonStandartLexicRepository
    ) {}

    async build(text: string): Promise<Anekdot> {
        return new Anekdot(text, await this._nonstdlexicrep.containsBadWords(text));
    }
}