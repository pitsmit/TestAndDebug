import {Command} from "@UICommands/BaseCommand";
import {ShowTable} from "@TechUI/ShowTable";

class CaseLine {
    public id: number;
    public name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}

export class ShowCasesCommand extends Command {
    get cases(): CaseLine[] {
        return this._cases;
    }

    protected readonly _cases: CaseLine[] = [];

    public async execute(): Promise<void> {
        ShowTable.show(this.cases, ['Номер', 'Название'], ["id", "name"], [10, 100]);
    }
}

export class ShowAdminCasesCommand extends ShowCasesCommand {
    protected readonly _cases: CaseLine[] = [
        new CaseLine(0, `Выйти`),
        new CaseLine(1, `Добавить анекдот`),
        new CaseLine(2, `Удалить анекдот`),
        new CaseLine(3, `Посмотреть ленту анекдотов`),
        new CaseLine(4, `Редактировать анекдот`),
    ];
}

export class ShowClientCasesCommand extends ShowCasesCommand {
    protected readonly _cases: CaseLine[] = [
        new CaseLine(0, `Выйти`),
        new CaseLine(1, `Добавить анекдот в избранное`),
        new CaseLine(2, `Удалить анекдот из избранного`),
        new CaseLine(3, `Посмотреть ленту анекдотов`),
        new CaseLine(4, `Посмотреть ленту избранных анекдотов`),
    ];
}

export class ShowVisitorCasesCommand extends ShowCasesCommand {
    protected readonly _cases: CaseLine[] = [
        new CaseLine(0, `Покинуть сайт`),
        new CaseLine(1, `Посмотреть ленту анекдотов`),
        new CaseLine(2, `Войти`),
        new CaseLine(3, `Зарегистрироваться`),
    ];
}