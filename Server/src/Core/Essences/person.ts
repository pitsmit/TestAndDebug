import {ROLE} from "@shared/types/roles";
import {IPerson} from "@shared/types/person";

export class Person implements IPerson {
    constructor(
        private readonly _token: string = "",
        private readonly _login: string = "",
        private readonly _name: string = "",
        private readonly _role: number = ROLE.USER
    ) {}

    get token(): string { return this._token; }
    get login(): string { return this._login; }
    get name(): string { return this._name; }
    get role(): number { return this._role; }
}