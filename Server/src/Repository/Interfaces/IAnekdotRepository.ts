import {Anekdot} from "@Core/Essences/anekdot";

export interface IAnekdotRepository {
    delete(id: number): Promise<void>;
    load(text: string, hasBadWords: boolean, lastModifiedDate: Date): Promise<number>;
    edit(id: number, text: string, hasBadWords: boolean, lastModifiedDate: Date): Promise<void>;
    get_part(page: number, limit: number): Promise<Anekdot[]>;
}