"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DBConfigProvider = void 0;
var _inversify = require("inversify");
var _databaseConfig = require("../../Core/Config/database-config");
var _dec, _class;
let DBConfigProvider = exports.DBConfigProvider = (_dec = (0, _inversify.injectable)(), _dec(_class = class DBConfigProvider {
  getConfig() {
    return _databaseConfig.DatabaseConfig.getConfig();
  }
}) || _class);