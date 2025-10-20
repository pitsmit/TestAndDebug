"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DBconnection = void 0;
var _pg = require("pg");
var _inversify = require("inversify");
var _logger = require("../../Core/Services/logger");
var _IDBConfigProvider = require("../Interfaces/IDBConfigProvider");
var _Errors = require("../../Core/Essences/Errors");
var _dec, _dec2, _dec3, _dec4, _class;
let DBconnection = exports.DBconnection = (_dec = (0, _inversify.injectable)(), _dec2 = function (target, key) {
  return (0, _inversify.inject)("IDBConfigProvider")(target, undefined, 0);
}, _dec3 = Reflect.metadata("design:type", Function), _dec4 = Reflect.metadata("design:paramtypes", [typeof _IDBConfigProvider.IDBConfigProvider === "undefined" ? Object : _IDBConfigProvider.IDBConfigProvider]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = class DBconnection {
  constructor(configProvider) {
    this.configProvider = configProvider;
    this._pool = void 0;
    const config = this.configProvider.getConfig();
    this._pool = new _pg.Pool(config);
  }
  async connect() {
    try {
      return await this._pool.connect();
    } catch (err) {
      _logger.logger.fatal(`База недоступна ${err.message}`);
      throw new _Errors.DatabaseConnectionError();
    }
  }
  get pool() {
    return this._pool;
  }
}) || _class) || _class) || _class) || _class);