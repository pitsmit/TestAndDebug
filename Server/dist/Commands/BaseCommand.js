"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Command = void 0;
class Command {
  constructor() {
    this._UserManager = void 0;
    this._AdminManager = void 0;
    this._LentaManager = void 0;
    this._PersonFabric = void 0;
  }
  setManagers(_UserManager, _AdminManager, _LentaManager, _UserFabric) {
    this._UserManager = _UserManager;
    this._AdminManager = _AdminManager;
    this._LentaManager = _LentaManager;
    this._PersonFabric = _UserFabric;
  }
  async execute() {}
}
exports.Command = Command;