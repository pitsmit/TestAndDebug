import {ROLE} from "@shared/types/roles";
import {Person} from "@Essences/person";

export class PersonBuilder {
    private _token: string = "token";
    private _name: string = "name";
    private _role: number = ROLE.ADMIN;

    withToken(token: string): this {
        this._token = token;
        return this;
    }

    withName(name: string): this {
        this._name = name;
        return this;
    }

    withRole(role: number): this {
        this._role = role;
        return this;
    }

    create(): Person {
        return new Person(
            this._token,
            this._name,
            this._role,
        );
    }
}