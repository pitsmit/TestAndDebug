import {IAnekdot} from "@shared/types/anekdot";

export class Anekdot implements IAnekdot {
    constructor(
        readonly text: string,
        readonly hasBadWords: boolean,
        readonly lastModifiedDate: Date,
        readonly id: number
    ) {}
}