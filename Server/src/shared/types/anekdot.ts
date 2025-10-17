export interface IAnekdot {
    readonly text: string;
    readonly hasBadWords: boolean;
    readonly lastModifiedDate: Date;
    readonly id: number;
}