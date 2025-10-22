import {ShowAdminCasesCommand, ShowClientCasesCommand, ShowVisitorCasesCommand} from "@TechUI/ShowCasesCommands";
import {Facade} from "@Facade/Facade";
import {Person} from "@Core/Essences/person";
import {Command} from "@Commands/BaseCommand";
import {input} from "@TechUI/iostream";
import {RegistrateCommand, EntryCommand} from "@Commands/AuthCommands";
import {ShowLentaCommand} from "@Commands/LentaCommands";
import {AddToFavouritesCommand, DeleteFromFavouritesCommand, ShowFavouritesCommand} from "@Commands/UserCommands";
import {DeleteAnekdotCommand, EditAnekdotCommand, LoadAnekdotCommand} from "@Commands/AdminCommands";
import {ShowTable} from "@TechUI/ShowTable";
import {ROLE} from "@shared/types/roles";
import process from "node:process";

export abstract class Experience {
    protected get person(): Person {
        return this._person;
    }

    protected get facade(): Facade {
        return this._facade;
    }

    protected constructor(
        protected readonly _facade: Facade,
        protected readonly _person: Person
    ) {}

    protected async ShowLenta() {
        let page: number = 1;
        let limit: number = 10;

        let command: Command = new ShowLentaCommand(page, limit);
        while (true) {
            await this.facade.execute(command);
            ShowTable.show(
                (command as ShowLentaCommand)._anekdots,
                ["ID", "Наличие нецензурной лексики", "Текст", "Дата последнего изменения"],
                ["id", "hasBadWords", "text", "lastModifiedDate"],
                [5, 10, 100, 25]
            );

            let ans: number = Number( await input("Ещё?(ДА-1, НЕТ-0): "));
            if (ans === 1) {
                page++;
                command = new ShowLentaCommand(page, limit);
            }
            else {
                return;
            }
        }
    }
}

export class AdminExperience extends Experience {
    constructor(facade: Facade, person: Person) {
        super(facade, person);
    }

    public async main(): Promise<void> {
        let command: Command|null;
        let caseNum: number;
        while (true) {
            await this.facade.execute(new ShowAdminCasesCommand());
            caseNum = Number(await input("Введите номер действия: "));

            try {
                switch (caseNum) {
                    case 0:
                        process.exit(0);
                        break;
                    case 1:
                        const data: string = await input("Введите ссылку или вставьте текст: ");
                        command = new LoadAnekdotCommand(this.person.token, data);
                        await this.facade.execute(command);
                        break;
                    case 2:
                        const id: number = Number(await input("Введите ID анекдота: "));
                        command = new DeleteAnekdotCommand(this.person.token, id);
                        await this.facade.execute(command);
                        break;
                    case 3:
                        await this.ShowLenta();
                        break;
                    case 4:
                        const idd: number = Number(await input("Введите ID анекдота: "));
                        const new_text: string = await input("Введите текст анекдота: ");
                        command = new EditAnekdotCommand(this.person.token, idd, new_text);
                        await this.facade.execute(command);
                        break;
                }
            } catch (e: any) {
                console.error(e.message);
            }
        }
    }
}

export class ClientExperience extends Experience {
    constructor(facade: Facade, person: Person) {
        super(facade, person);
    }

    private async input_anekdot_id(): Promise<number> {
        return Number(await input("Введите ID анекдота: "));
    }

    public async main(): Promise<void> {
        let command: Command|null;
        let caseNum: number;
        while (true) {
            await this.facade.execute(new ShowClientCasesCommand());
            caseNum = Number(await input("Введите номер действия: "));

            try {
                switch (caseNum) {
                    case 0:
                        process.exit(0);
                        break;
                    case 1:
                        command = new AddToFavouritesCommand(this.person.token, await this.input_anekdot_id());
                        await this.facade.execute(command);
                        break;
                    case 2:
                        command = new DeleteFromFavouritesCommand(this.person.token, await this.input_anekdot_id());
                        await this.facade.execute(command);
                        break;
                    case 3:
                        await this.ShowLenta();
                        break;
                    case 4:
                        let page: number = 1;
                        let limit: number = 10;

                        command = new ShowFavouritesCommand(this.person.token, page, limit);
                        while (true) {
                            await this.facade.execute(command);
                            ShowTable.show(
                                (command as ShowFavouritesCommand)._anekdots,
                                ["ID", "Наличие нецензурной лексики", "Текст", "Дата последнего изменения"],
                                ["id", "hasBadWords", "text", "lastModifiedDate"],
                                [5, 10, 100, 25]
                            );

                            let ans: number = Number( await input("Ещё?(ДА-1, НЕТ-0): "));
                            if (ans === 1) {
                                page++;
                                command = new ShowFavouritesCommand(this.person.token, page, limit);
                            }
                            else break;
                        }
                        break;
                }
            } catch (e: any) {
                console.error(e.message);
            }
        }
    }
}

export class VisitorExperience extends Experience {
    constructor(facade: Facade, person: Person) {
        super(facade, person);
    }

    async input_entry_credentials(): Promise<{ login: string, pass: string }> {
        const login: string = await input("Введите логин: ");
        const pass: string = await input("Введите пароль: ");

        return {login, pass};
    }

    async input_register_credentials(): Promise<{
        login: string,
        password: string,
        name: string,
        role: number
    }> {
        const login: string = await input("Введите логин: ");
        const password: string = await input("Введите пароль: ");
        const name: string = await input("Введите отображаемое имя: ");
        const role: number = Number(await input("Введите роль: (0 - пользователь, 1 - админ)"));

        return {login, password, name, role};
    }

    public async main(): Promise<void> {
        let command: Command|null;
        let caseNum: number;

        let person: Person;
        let entry_credentials: { login: string, pass: string };
        while (true) {
            await this.facade.execute(new ShowVisitorCasesCommand());
            caseNum = Number(await input("Введите номер действия: "));

            try {
                switch (caseNum) {
                    case 0:
                        process.exit(0);
                        break;
                    case 1:
                        await this.ShowLenta();
                        break;
                    case 2:
                        entry_credentials = await this.input_entry_credentials();
                        command = new EntryCommand(entry_credentials.login, entry_credentials.pass);
                        await this.facade.execute(command);
                        person = (command as RegistrateCommand).person;
                        if (person.role == ROLE.USER)
                            await new ClientExperience(this.facade, person).main();
                        else
                            await new AdminExperience(this.facade, person).main();
                        return;
                    case 3:
                        const { login, password, name, role } = await this.input_register_credentials();
                        command = new RegistrateCommand(
                            login, password, name, role);
                        await this.facade.execute(command);
                        person = (command as RegistrateCommand).person;

                        if (person.role == ROLE.USER)
                            await new ClientExperience(this.facade, person).main();
                        else
                            await new AdminExperience(this.facade, person).main();
                        return;
            }
            } catch (e: any) {
                console.error(e.message);
            }
        }
    }
}