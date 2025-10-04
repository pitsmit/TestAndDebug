export interface INonStandartLexicRepository {
    containsBadWords(text: string): Promise<boolean>;
}