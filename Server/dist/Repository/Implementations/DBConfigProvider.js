"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DBConfigProvider = void 0;
var _inversify = require("inversify");
var _dec, _class;
let DBConfigProvider = exports.DBConfigProvider = (_dec = (0, _inversify.injectable)(), _dec(_class = class DBConfigProvider {
  getConfig() {
    return {
      user: process.env.USER,
      host: process.env.HOST,
      database: process.env.DATABASE_NAME,
      password: process.env.PASSWORD,
      port: Number(process.env.PORT)
    };
  }
}) || _class);