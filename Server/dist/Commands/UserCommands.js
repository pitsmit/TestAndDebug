"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserManagerCommand = exports.ShowFavouritesCommand = exports.DeleteFromFavouritesCommand = exports.AddToFavouritesCommand = void 0;
var _BaseCommand = require("./BaseCommand");
var _logger = require("../Core/Services/logger");
class UserManagerCommand extends _BaseCommand.Command {
  constructor(_token) {
    super();
    this._token = _token;
  }
}
exports.UserManagerCommand = UserManagerCommand;
class AddToFavouritesCommand extends UserManagerCommand {
  constructor(token, _anekdot_id) {
    super(token);
    this._anekdot_id = _anekdot_id;
    this.anekdot = void 0;
  }
  async execute() {
    this.anekdot = await this._UserManager.AddToFavourites(this._token, this._anekdot_id);
    _logger.logger.info('Добавление анекдота в избранное');
  }
}
exports.AddToFavouritesCommand = AddToFavouritesCommand;
class DeleteFromFavouritesCommand extends UserManagerCommand {
  constructor(token, _anekdot_id) {
    super(token);
    this._anekdot_id = _anekdot_id;
  }
  async execute() {
    await this._UserManager.DeleteFromFavourites(this._token, this._anekdot_id);
    _logger.logger.info('Удаление анекдота из избранного');
  }
}
exports.DeleteFromFavouritesCommand = DeleteFromFavouritesCommand;
class ShowFavouritesCommand extends UserManagerCommand {
  constructor(token, _page, _limit) {
    super(token);
    this._page = _page;
    this._limit = _limit;
    this._anekdots = [];
  }
  async execute() {
    this._anekdots = await this._UserManager.ShowFavourites(this._token, this._page, this._limit);
    _logger.logger.info('Показ ленты избранного');
  }
}
exports.ShowFavouritesCommand = ShowFavouritesCommand;