import {Anekdot} from "@Core/Essences/anekdot";

export interface IUserFavouritesRepository {
    add(user_id: number, anekdot_id: number) : Promise<{content: string, hasBadWords: boolean, lastModifiedDate: Date}>;
    remove(user_id: number, anekdot_id: number) : Promise<void>;
    get_part(user_id: number, page: number, limit: number): Promise<Anekdot[]>;
}