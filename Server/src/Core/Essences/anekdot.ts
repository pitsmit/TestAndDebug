export class Anekdot {
    constructor(
        readonly text: string,
        readonly hasBadWords: boolean,
        readonly lastModifiedDate: Date,
        readonly id: number
    ) {}
}