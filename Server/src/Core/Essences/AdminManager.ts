import {inject, injectable, multiInject} from "inversify";
import {IAnekdotDirector} from "@Core/Services/anekdotdirectors";
import {IAnekdotRepository} from "@IRepository/IAnekdotRepository";
import {Anekdot} from "@Core/Essences/anekdot";
import {Person} from "@Core/Essences/person";
import {logger} from "@Core/Services/logger";

export interface IAdminManager {
    LoadAnekdot(admin: Person, data: string): Promise<void>;
    DeleteAnekdot(admin: Person, id: number): Promise<void>;
    EditAnekdot(admin: Person, id: number, new_text: string): Promise<void>;
}

@injectable()
export class AdminManager implements IAdminManager {
    private readonly directors: IAnekdotDirector[];

    constructor(@multiInject(Symbol.for('IAnekdotDirector')) directors: IAnekdotDirector[],
                @inject("IAnekdotRepository") private _anekdotRepository: IAnekdotRepository) {
        this.directors = directors;
    }

    private getDirector(data: string): IAnekdotDirector {
        const director = this.directors.find(s => s.canHandle(data));
        if (!director) {
            const msg: string = `Не поддерживаемый тип данных анекдота`;
            logger.warn(msg);
            throw new Error(msg);
        }
        return director;
    }

    async LoadAnekdot(admin: Person, data: string): Promise<void> {
        const director: IAnekdotDirector = this.getDirector(data);
        let anekdot: Anekdot = await director.create(data);
        await this._anekdotRepository.load(anekdot);
    }

    async DeleteAnekdot(admin: Person, id: number): Promise<void> {
        await this._anekdotRepository.delete(id);
    }

    async EditAnekdot(admin: Person, id: number, new_text: string): Promise<void> {
        await this._anekdotRepository.edit(id, new_text);
    }
}