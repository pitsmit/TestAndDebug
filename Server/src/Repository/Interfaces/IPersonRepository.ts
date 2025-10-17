export interface IPersonRepository {
    get(login: string, password: string): Promise<{role: number, id: number, name: string}>;
    create(login: string, password: string, name: string, role: number): Promise<number>;
}