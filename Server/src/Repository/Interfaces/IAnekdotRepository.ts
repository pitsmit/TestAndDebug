import {Anekdot} from "@Core/Essences/anekdot";

export interface IAnekdotRepository {
    delete(id: number): Promise<void>;
    load(anekdot: Anekdot): Promise<void>;
    edit(id: number, anekdot: Anekdot): Promise<void>;
    get_part(page: number, limit: number): Promise<Anekdot[]>;
}