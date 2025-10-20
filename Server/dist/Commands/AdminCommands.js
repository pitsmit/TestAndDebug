"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LoadAnekdotCommand = exports.EditAnekdotCommand = exports.DeleteAnekdotCommand = exports.AdminCommand = void 0;
var _BaseCommand = require("./BaseCommand");
var _logger = require("../Core/Services/logger");
class AdminCommand extends _BaseCommand.Command {
  constructor(_token) {
    super();
    this._token = _token;
  }
}
exports.AdminCommand = AdminCommand;
class LoadAnekdotCommand extends AdminCommand {
  constructor(token, _data) {
    super(token);
    this._data = _data;
    this.anekdot = void 0;
  }
  async execute() {
    this.anekdot = await this._AdminManager.LoadAnekdot(this._token, this._data);
    _logger.logger.info('Загрузка анекдота');
  }
}
exports.LoadAnekdotCommand = LoadAnekdotCommand;
class DeleteAnekdotCommand extends AdminCommand {
  constructor(token, _id) {
    super(token);
    this._id = _id;
  }
  async execute() {
    await this._AdminManager.DeleteAnekdot(this._token, this._id);
    _logger.logger.info('Удаление анекдота');
  }
}
exports.DeleteAnekdotCommand = DeleteAnekdotCommand;
class EditAnekdotCommand extends AdminCommand {
  constructor(token, _id, _new_text) {
    super(token);
    this._id = _id;
    this._new_text = _new_text;
    this.anekdot = void 0;
  }
  async execute() {
    this.anekdot = await this._AdminManager.EditAnekdot(this._token, this._id, this._new_text);
    _logger.logger.info('Редактирование анекдота');
  }
}
exports.EditAnekdotCommand = EditAnekdotCommand;