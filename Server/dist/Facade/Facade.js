"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Facade = void 0;
require("reflect-metadata");
var _container = require("./container");
require("./bindings");
class Facade {
  constructor() {
    this.managers = [_container.container.get("IUserManager"), _container.container.get("IAdminManager"), _container.container.get("ILentaManager"), _container.container.get("IPersonFabric")];
  }
  async execute(command) {
    command.setManagers(...this.managers);
    await command.execute();
  }
}
exports.Facade = Facade;