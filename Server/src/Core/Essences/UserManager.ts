import {inject, injectable} from "inversify";
import {Person} from "@Core/Essences/person";
import {IUserFavouritesRepository} from "@IRepository/IUserFavouritesRepository";
import {Anekdot} from "@Core/Essences/anekdot";

export interface IUserManager {
    AddToFavourites(user: Person, id: number): Promise<void>;
    DeleteFromFavourites(user: Person, id: number): Promise<void>;
    ShowFavourites(user: Person, page: number, limit?: number): Promise<Anekdot[]>;
}

@injectable()
export class UserManager implements IUserManager {
    constructor(@inject("IUserFavouritesRepository") private _favouritesRepository: IUserFavouritesRepository) {
    };

    async AddToFavourites(user: Person, id: number): Promise<void> {
        await this._favouritesRepository.add(user.login, id);
    }

    async DeleteFromFavourites(user: Person, id: number): Promise<void> {
        await this._favouritesRepository.remove(user.login, id);
    }

    async ShowFavourites(user: Person, page: number, limit: number = 10): Promise<Anekdot[]> {
        return await this._favouritesRepository.get_part(user.login, page, limit);
    }
}