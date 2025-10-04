import {Person} from "@Core/Essences/person";

export interface IPersonRepository {
    get(login: string, password: string, token: string): Promise<Person>;
    create(login: string, password: string, name: string, token: string, role: number): Promise<Person>;
}