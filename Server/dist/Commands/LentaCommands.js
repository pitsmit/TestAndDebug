"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ShowLentaCommand = void 0;
var _BaseCommand = require("./BaseCommand");
var _logger = require("../Core/Services/logger");
class ShowLentaCommand extends _BaseCommand.Command {
  constructor(_page, _limit) {
    super();
    this._page = _page;
    this._limit = _limit;
    this._anekdots = [];
  }
  async execute() {
    this._anekdots = await this._LentaManager.ShowLenta(this._page, this._limit);
    _logger.logger.info("показ ленты");
  }
}
exports.ShowLentaCommand = ShowLentaCommand;