"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NonStandartLexicRepository = void 0;
var _inversify = require("inversify");
var _IDBconnection = require("../Interfaces/IDBconnection");
var _dec, _dec2, _dec3, _dec4, _class;
let NonStandartLexicRepository = exports.NonStandartLexicRepository = (_dec = (0, _inversify.injectable)(), _dec2 = function (target, key) {
  return (0, _inversify.inject)("IDBconnection")(target, undefined, 0);
}, _dec3 = Reflect.metadata("design:type", Function), _dec4 = Reflect.metadata("design:paramtypes", [typeof _IDBconnection.IDBconnection === "undefined" ? Object : _IDBconnection.IDBconnection]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = class NonStandartLexicRepository {
  constructor(DB) {
    this.DB = DB;
  }
  async containsBadWords(text) {
    let client = await this.DB.connect();
    try {
      const query = `
            SELECT EXISTS(
                SELECT 1 FROM nonstandartlexic 
                WHERE $1 LIKE '%' || word || '%'
            ) as has_bad_words;`;
      const result = await client.query(query, [text]);
      return result.rows[0].has_bad_words;
    } finally {
      client.release();
    }
  }
}) || _class) || _class) || _class) || _class);