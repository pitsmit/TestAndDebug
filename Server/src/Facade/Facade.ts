import "reflect-metadata";
import {IAdminManager} from "@Core/Essences/AdminManager";
import {ILentaManager} from "@Core/Essences/LentaManager";
import {IUserManager} from "@Core/Essences/UserManager";
import {Command} from "@UICommands/BaseCommand";
import {IPersonFabric} from "@Core/Services/personfabric";
import {container} from "@Facade/container";
import '@Facade/bindings'

export class Facade {
    private readonly _UserManager!: IUserManager
    private readonly _AdminManager!: IAdminManager
    private readonly _LentaManager!: ILentaManager
    private readonly _PersonFabric!: IPersonFabric

    constructor() {
        this._UserManager = container.get<IUserManager>("IUserManager");
        this._AdminManager = container.get<IAdminManager>("IAdminManager");
        this._LentaManager = container.get<ILentaManager>("ILentaManager");
        this._PersonFabric = container.get<IPersonFabric>("IPersonFabric");
    }

    async execute(command: Command): Promise<void> {
        command.setManagers(
            this._UserManager,
            this._AdminManager,
            this._LentaManager,
            this._PersonFabric,
        )

        await command.execute();
    }
}