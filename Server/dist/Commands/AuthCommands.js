"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RegistrateCommand = exports.EntryCommand = exports.AuthCommand = void 0;
var _BaseCommand = require("./BaseCommand");
var _logger = require("../Core/Services/logger");
class AuthCommand extends _BaseCommand.Command {
  constructor(_login, _password) {
    super();
    this._login = _login;
    this._password = _password;
    this.person = void 0;
  }
}
exports.AuthCommand = AuthCommand;
class EntryCommand extends AuthCommand {
  constructor(login, password) {
    super(login, password);
  }
  async execute() {
    this.person = await this._PersonFabric.get(this._login, this._password);
    _logger.logger.info("Пользователь вошёл");
  }
}
exports.EntryCommand = EntryCommand;
class RegistrateCommand extends AuthCommand {
  constructor(login, password, _name, _role) {
    super(login, password);
    this._name = _name;
    this._role = _role;
  }
  async execute() {
    this.person = await this._PersonFabric.create(this._login, this._password, this._name, this._role);
    _logger.logger.info("Регистрация успешна");
  }
}
exports.RegistrateCommand = RegistrateCommand;