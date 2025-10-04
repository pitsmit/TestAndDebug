import {IAnekdot} from "@shared/types/anekdot";

export class Anekdot implements IAnekdot {
    constructor(
        private readonly _text: string = "",
        private readonly _hasBadWords: boolean = false,
        private readonly _lastModifiedDate: Date = new Date(),
        private readonly _id: number = 0
    ) {}

    get text(): string { return this._text; }
    get hasBadWords(): boolean { return this._hasBadWords; }
    get lastModifiedDate(): Date { return this._lastModifiedDate; }
    get id(): number { return this._id; }
}