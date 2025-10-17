import "reflect-metadata";
import {IAdminManager} from "@Core/Essences/AdminManager";
import {ILentaManager} from "@Core/Essences/LentaManager";
import {IUserManager} from "@Core/Essences/UserManager";
import {Command} from "@UICommands/BaseCommand";
import {IPersonFabric} from "@Core/Services/personfabric";
import {container} from "@Facade/container";
import '@Facade/bindings'

export class Facade {
    private readonly managers = [
        container.get<IUserManager>("IUserManager"),
        container.get<IAdminManager>("IAdminManager"),
        container.get<ILentaManager>("ILentaManager"),
        container.get<IPersonFabric>("IPersonFabric")
    ] as const;

    async execute(command: Command): Promise<void> {
        command.setManagers(...this.managers);
        await command.execute();
    }
}