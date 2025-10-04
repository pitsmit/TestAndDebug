import {IUserManager} from "@Core/Essences/UserManager";
import {ILentaManager} from "@Core/Essences/LentaManager";
import {IAdminManager} from "@Core/Essences/AdminManager";
import {IPersonFabric} from "@Core/Services/personfabric";

export abstract class Command {
    protected _UserManager!: IUserManager;
    protected _AdminManager!: IAdminManager;
    protected _LentaManager!: ILentaManager;
    protected _PersonFabric!: IPersonFabric;

    setManagers(
        _UserManager: IUserManager,
        _AdminManager: IAdminManager,
        _LentaManager: ILentaManager,
        _UserFabric: IPersonFabric): void {

        this._UserManager = _UserManager;
        this._AdminManager = _AdminManager;
        this._LentaManager = _LentaManager;
        this._PersonFabric = _UserFabric;
    }

    async execute(): Promise<void> {}
}

