"use strict";

require("reflect-metadata");
var _container = require("./container");
var _PersonRepository = require("../Repository/Implementations/PersonRepository");
var _AnekdotRepository = require("../Repository/Implementations/AnekdotRepository");
var _NonStandartLexicRepository = require("../Repository/Implementations/NonStandartLexicRepository");
var _jwt = require("../Core/Services/jwt");
var _UserFavouritesRepository = require("../Repository/Implementations/UserFavouritesRepository");
var _personfabric = require("../Core/Services/personfabric");
var _AdminManager = require("../Core/Essences/AdminManager");
var _UserManager = require("../Core/Essences/UserManager");
var _DBconnection = require("../Repository/Implementations/DBconnection");
var _parsers = require("../Core/Services/parsers");
var _LentaManager = require("../Core/Essences/LentaManager");
var _DBConfigProvider = require("../Repository/Implementations/DBConfigProvider");
var _anekdotPropertiesExtractor = require("../Core/Services/anekdotPropertiesExtractor");
_container.container.bind("IDBConfigProvider").to(_DBConfigProvider.DBConfigProvider).inSingletonScope();
_container.container.bind("IDBconnection").to(_DBconnection.DBconnection).inSingletonScope();
_container.container.bind("IPersonRepository").to(_PersonRepository.PersonRepository).inSingletonScope();
_container.container.bind("IAnekdotRepository").to(_AnekdotRepository.AnekdotRepository).inSingletonScope();
_container.container.bind("INonStandartLexicRepository").to(_NonStandartLexicRepository.NonStandartLexicRepository).inSingletonScope();
_container.container.bind("IUserFavouritesRepository").to(_UserFavouritesRepository.UserFavouritesRepository).inSingletonScope();
_container.container.bind("IAuthService").to(_jwt.AuthService).inSingletonScope();
_container.container.bind("IPersonFabric").to(_personfabric.PersonFabric).inSingletonScope();
_container.container.bind("IAdminManager").to(_AdminManager.AdminManager).inSingletonScope();
_container.container.bind("IUserManager").to(_UserManager.UserManager).inSingletonScope();
_container.container.bind("ILentaManager").to(_LentaManager.LentaManager).inSingletonScope();
_container.container.bind(_anekdotPropertiesExtractor.AnekdotPropertiesExtractor).toSelf().inSingletonScope();
const parsers = [_parsers.AnekdotRuParser, _parsers.AnekdotovStreetParser];
for (const parser of parsers) {
  _container.container.bind(Symbol.for('ISiteParser')).to(parser).inTransientScope();
}