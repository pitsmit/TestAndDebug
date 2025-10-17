import {inject, injectable} from "inversify";
import {IAnekdotRepository} from "@IRepository/IAnekdotRepository";
import {Anekdot} from "@Core/Essences/anekdot";
import {AnekdotFactory} from "@Services/anekdotfactory";

export interface IAdminManager {
    LoadAnekdot(token: string, data: string): Promise<void>;
    DeleteAnekdot(token: string, id: number): Promise<void>;
    EditAnekdot(token: string, id: number, new_text: string): Promise<void>;
}

@injectable()
export class AdminManager implements IAdminManager {
    constructor(@inject("IAnekdotRepository") private _anekdotRepository: IAnekdotRepository,
                @inject(AnekdotFactory) private _anekdotFactory: AnekdotFactory)
    {}

    async LoadAnekdot(token: string, data: string): Promise<void> {
        let anekdot: Anekdot = await this._anekdotFactory.create(data);
        await this._anekdotRepository.load(anekdot);
    }

    async DeleteAnekdot(token: string, id: number): Promise<void> {
        await this._anekdotRepository.delete(id);
    }

    async EditAnekdot(token: string, id: number, new_text: string): Promise<void> {
        let anekdot: Anekdot = await this._anekdotFactory.create(new_text);
        await this._anekdotRepository.edit(id, anekdot);
    }
}