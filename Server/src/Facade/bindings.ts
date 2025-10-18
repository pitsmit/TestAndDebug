import 'reflect-metadata';
import { container } from '@Facade/container';
import { PersonRepository } from '@Repository/PersonRepository';
import { AnekdotRepository } from '@Repository/AnekdotRepository';
import { NonStandartLexicRepository } from '@Repository/NonStandartLexicRepository';
import { AuthService } from '@Core/Services/jwt';
import { UserFavouritesRepository } from '@Repository/UserFavouritesRepository';
import { PersonFabric } from '@Core/Services/personfabric';
import { AdminManager } from '@Core/Essences/AdminManager';
import { UserManager } from '@Core/Essences/UserManager';
import { DBconnection } from '@Repository/DBconnection';
import { AnekdotRuParser, AnekdotovStreetParser, ISiteParser } from '@Core/Services/parsers';
import {LentaManager} from "@Core/Essences/LentaManager";
import { DBConfigProvider } from '@Repository/DBConfigProvider';
import { IDBConfigProvider } from '@IRepository/IDBConfigProvider';
import { AnekdotPropertiesExtractor} from "@Services/anekdotPropertiesExtractor";

container.bind<IDBConfigProvider>("IDBConfigProvider").to(DBConfigProvider).inSingletonScope();
container.bind("IDBconnection").to(DBconnection).inSingletonScope();

container.bind("IPersonRepository").to(PersonRepository).inSingletonScope();
container.bind("IAnekdotRepository").to(AnekdotRepository).inSingletonScope();
container.bind("INonStandartLexicRepository").to(NonStandartLexicRepository).inSingletonScope();
container.bind("IUserFavouritesRepository").to(UserFavouritesRepository).inSingletonScope();

container.bind("IAuthService").to(AuthService).inSingletonScope();
container.bind("IPersonFabric").to(PersonFabric).inSingletonScope();
container.bind("IAdminManager").to(AdminManager).inSingletonScope();
container.bind("IUserManager").to(UserManager).inSingletonScope();
container.bind("ILentaManager").to(LentaManager).inSingletonScope();

container.bind(AnekdotPropertiesExtractor).toSelf().inSingletonScope();

const parsers = [AnekdotRuParser, AnekdotovStreetParser];
for (const parser of parsers) {
    container.bind<ISiteParser>(Symbol.for('ISiteParser')).to(parser).inTransientScope();
}