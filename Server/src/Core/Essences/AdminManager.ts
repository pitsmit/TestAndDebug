import {inject, injectable} from "inversify";
import {IAnekdotRepository} from "@IRepository/IAnekdotRepository";
import {Anekdot} from "@Core/Essences/anekdot";
import {AnekdotPropertiesExtractor} from "@Services/anekdotPropertiesExtractor";
import {IAuthService} from "@Services/jwt";
import {ROLE} from "@shared/types/roles";

export interface IAdminManager {
    LoadAnekdot(token: string, data: string): Promise<Anekdot>;
    DeleteAnekdot(token: string, id: number): Promise<void>;
    EditAnekdot(token: string, id: number, new_text: string): Promise<Anekdot>;
}

@injectable()
export class AdminManager implements IAdminManager {
    constructor(@inject("IAnekdotRepository") private _anekdotRepository: IAnekdotRepository,
                @inject(AnekdotPropertiesExtractor) private _anekdotPropertiesExtractor: AnekdotPropertiesExtractor,
                @inject("IAuthService") private _authService: IAuthService)
    {}

    async LoadAnekdot(token: string, data: string): Promise<Anekdot> {
        this._authService.checkRole(token, ROLE.ADMIN);

        const {text, hasBadWords, lastModifiedDate} = await this._anekdotPropertiesExtractor.extract(data);
        const id: number = await this._anekdotRepository.load(text, hasBadWords, lastModifiedDate);
        return new Anekdot(text, hasBadWords, lastModifiedDate, id);
    }

    async DeleteAnekdot(token: string, id: number): Promise<void> {
        this._authService.checkRole(token, ROLE.ADMIN);

        await this._anekdotRepository.delete(id);
    }

    async EditAnekdot(token: string, id: number, new_text: string): Promise<Anekdot> {
        this._authService.checkRole(token, ROLE.ADMIN);

        const {text, hasBadWords, lastModifiedDate} = await this._anekdotPropertiesExtractor.extract(new_text);
        await this._anekdotRepository.edit(id, text, hasBadWords, lastModifiedDate);
        return new Anekdot(text, hasBadWords, lastModifiedDate, id);
    }
}