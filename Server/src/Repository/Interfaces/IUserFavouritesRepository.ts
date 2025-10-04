import {Anekdot} from "@Core/Essences/anekdot";

export interface IUserFavouritesRepository {
    add(login: string, anekdot_id: number) : Promise<void>;
    remove(login: string, anekdot_id: number) : Promise<void>;
    get_part(login: string, page: number, limit: number): Promise<Anekdot[]>;
}