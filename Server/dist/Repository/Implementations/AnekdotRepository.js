"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AnekdotRepository = void 0;
var _inversify = require("inversify");
var _anekdot = require("../../Core/Essences/anekdot");
var _IDBconnection = require("../Interfaces/IDBconnection");
var _logger = require("../../Core/Services/logger");
var _Errors = require("../../Core/Essences/Errors");
var _dec, _dec2, _dec3, _dec4, _class;
let AnekdotRepository = exports.AnekdotRepository = (_dec = (0, _inversify.injectable)(), _dec2 = function (target, key) {
  return (0, _inversify.inject)("IDBconnection")(target, undefined, 0);
}, _dec3 = Reflect.metadata("design:type", Function), _dec4 = Reflect.metadata("design:paramtypes", [typeof _IDBconnection.IDBconnection === "undefined" ? Object : _IDBconnection.IDBconnection]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = class AnekdotRepository {
  constructor(DB) {
    this.DB = DB;
  }
  async get_part(page = 1, limit = 10) {
    let client = await this.DB.connect();
    try {
      const offset = (page - 1) * limit;
      const query = `SELECT * FROM Anekdot ORDER BY loaddate DESC LIMIT $1 OFFSET $2`;
      const res = await client.query(query, [limit, offset]);
      return res.rows.map(row => new _anekdot.Anekdot(row.content, row.hasbadwords, row.loaddate, row.id));
    } catch (e) {
      _logger.logger.error(e.message);
      throw new _Errors.PaginationError();
    } finally {
      client.release();
    }
  }
  async delete(id) {
    if (id <= 0) throw new _Errors.WrongIDError();
    let client = await this.DB.connect();
    try {
      await client.query('DELETE FROM Favourites WHERE AnekdotID = $1', [id]);
      const result = await client.query('DELETE FROM Anekdot WHERE ID = $1', [id]);
      if (result.rowCount == 0) throw new _Errors.NOAnekdotError();
    } finally {
      client.release();
    }
  }
  async load(text, hasBadWords, lastModifiedDate) {
    if (!text.trim().length) {
      const msg = `Пустой текст анекдота`;
      _logger.logger.warn(msg);
      throw new _Errors.EmptyAnekdotError(msg);
    }
    let client = await this.DB.connect();
    try {
      const query = `INSERT INTO Anekdot (content, hasbadwords, loaddate)
                            VALUES ($1, $2, $3) RETURNING id`;
      const res = await client.query(query, [text, hasBadWords, lastModifiedDate]);
      return res.rows[0].id;
    } finally {
      client.release();
    }
  }
  async edit(id, text, hasBadWords, lastModifiedDate) {
    if (!text.trim().length) {
      const msg = `Пустой текст анекдота`;
      _logger.logger.warn(msg);
      throw new _Errors.EmptyAnekdotError(msg);
    }
    if (id <= 0) throw new _Errors.WrongIDError();
    let client = await this.DB.connect();
    try {
      const result = await client.query(`UPDATE Anekdot SET content = $1, loaddate = $2, hasbadwords = $3 WHERE id = $4`, [text, lastModifiedDate, hasBadWords, id]);
      if (result.rowCount == 0) throw new _Errors.NOAnekdotError();
    } finally {
      client.release();
    }
  }
}) || _class) || _class) || _class) || _class);