import {inject} from "inversify";
import {IAuthService} from "@Core/Services/jwt";
import {Person} from "@Core/Essences/person";
import {IPersonRepository} from "@IRepository/IPersonRepository";

export interface IPersonFabric {
    get(login: string, password: string): Promise<Person>;
    create(login: string, password: string, name: string, role: number): Promise<Person>;
}

export class PersonFabric implements IPersonFabric {
    constructor(@inject("IPersonRepository") private _personrepository: IPersonRepository,
                @inject("IAuthService") private _authService: IAuthService) {}

    public async get(login: string, password: string): Promise<Person> {
        const {role, id, name} = await this._personrepository.get(login, password);
        const token: string = this._authService.generateToken(id);
        return new Person(token, name, role);
    }

    public async create(login: string, password: string, name: string, role: number): Promise<Person> {
        const id: number = await this._personrepository.create(login, password, name, role);
        const token: string = this._authService.generateToken(id);
        return new Person(token, name, role);
    }
}