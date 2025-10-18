import {IPerson} from "@shared/types/person";

export class Person implements IPerson {
    constructor(
        readonly token: string,
        readonly name: string,
        readonly role: number
    ) {}
}