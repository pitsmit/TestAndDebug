import {inject, injectable} from "inversify";
import {IUserFavouritesRepository} from "@IRepository/IUserFavouritesRepository";
import {Anekdot} from "@Core/Essences/anekdot";
import {IAuthService} from "@Services/jwt";
import {ROLE} from "@shared/types/roles";

export interface IUserManager {
    AddToFavourites(token: string, anekdot_id: number): Promise<Anekdot>;
    DeleteFromFavourites(token: string, anekdot_id: number): Promise<void>;
    ShowFavourites(token: string, page: number, limit?: number): Promise<Anekdot[]>;
}

@injectable()
export class UserManager implements IUserManager {
    constructor(@inject("IUserFavouritesRepository") private _favouritesRepository: IUserFavouritesRepository,
                @inject("IAuthService") private _authService: IAuthService) {
    };

    async AddToFavourites(token: string, anekdot_id: number): Promise<Anekdot> {
        this._authService.checkRole(token, ROLE.USER);

        const {id} = this._authService.verifyToken(token);
        const {content, hasBadWords, lastModifiedDate} = await this._favouritesRepository.add(id, anekdot_id);
        return new Anekdot(content, hasBadWords, lastModifiedDate, anekdot_id);
    }

    async DeleteFromFavourites(token: string, anekdot_id: number): Promise<void> {
        this._authService.checkRole(token, ROLE.USER);

        const {id} = this._authService.verifyToken(token);
        await this._favouritesRepository.remove(id, anekdot_id);
    }

    async ShowFavourites(token: string, page: number, limit: number = 10): Promise<Anekdot[]> {
        this._authService.checkRole(token, ROLE.USER);

        const {id} = this._authService.verifyToken(token);
        return await this._favouritesRepository.get_part(id, page, limit);
    }
}