import {Anekdot} from "@Core/Essences/anekdot";
import {IAnekdotRepository} from "@IRepository/IAnekdotRepository";
import {inject, injectable} from "inversify";

export interface ILentaManager {
    ShowLenta(page: number, limit: number): Promise<Anekdot[]>
}

@injectable()
export class LentaManager implements ILentaManager {
    constructor(
        @inject("IAnekdotRepository") private _anekdotRepository: IAnekdotRepository
    ) {}

    async ShowLenta(page: number, limit: number = 10): Promise<Anekdot[]> {
        return await this._anekdotRepository.get_part(page, limit);
    }
}