import {inject, injectable} from "inversify";
import {IUserFavouritesRepository} from "@IRepository/IUserFavouritesRepository";
import {Anekdot} from "@Core/Essences/anekdot";
import {IAuthService} from "@Services/jwt";

export interface IUserManager {
    AddToFavourites(token: string, anekdot_id: number): Promise<void>;
    DeleteFromFavourites(token: string, anekdot_id: number): Promise<void>;
    ShowFavourites(token: string, page: number, limit?: number): Promise<Anekdot[]>;
}

@injectable()
export class UserManager implements IUserManager {
    constructor(@inject("IUserFavouritesRepository") private _favouritesRepository: IUserFavouritesRepository,
                @inject("IAuthService") private _authService: IAuthService) {
    };

    async AddToFavourites(token: string, anekdot_id: number): Promise<void> {
        const user_id: number = this._authService.verifyToken(token);
        await this._favouritesRepository.add(user_id, anekdot_id);
    }

    async DeleteFromFavourites(token: string, anekdot_id: number): Promise<void> {
        const user_id: number = this._authService.verifyToken(token);
        await this._favouritesRepository.remove(user_id, anekdot_id);
    }

    async ShowFavourites(token: string, page: number, limit: number = 10): Promise<Anekdot[]> {
        const user_id: number = this._authService.verifyToken(token);
        return await this._favouritesRepository.get_part(user_id, page, limit);
    }
}