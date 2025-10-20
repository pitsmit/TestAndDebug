"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserFavouritesRepository = void 0;
var _inversify = require("inversify");
var _IDBconnection = require("../Interfaces/IDBconnection");
var _anekdot = require("../../Core/Essences/anekdot");
var _Errors = require("../../Core/Essences/Errors");
var _dec, _dec2, _dec3, _dec4, _class;
let UserFavouritesRepository = exports.UserFavouritesRepository = (_dec = (0, _inversify.injectable)(), _dec2 = function (target, key) {
  return (0, _inversify.inject)("IDBconnection")(target, undefined, 0);
}, _dec3 = Reflect.metadata("design:type", Function), _dec4 = Reflect.metadata("design:paramtypes", [typeof _IDBconnection.IDBconnection === "undefined" ? Object : _IDBconnection.IDBconnection]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = class UserFavouritesRepository {
  constructor(DB) {
    this.DB = DB;
  }
  async add(user_id, anekdot_id) {
    let client = await this.DB.connect();
    try {
      const res = await client.query(`SELECT content, hasbadwords, loaddate from anekdot WHERE  id = $1`, [anekdot_id]);
      if (!res.rowCount) throw new _Errors.NOAnekdotError();
      try {
        await client.query(`INSERT INTO favourites (userid, anekdotid) VALUES ($1, $2)`, [user_id, anekdot_id]);
      } catch (e) {
        throw new _Errors.AnekdotInFavouritesError();
      }
      return {
        content: res.rows[0].content,
        hasBadWords: res.rows[0].hasbadwords,
        lastModifiedDate: res.rows[0].loaddate
      };
    } finally {
      client.release();
    }
  }
  async remove(user_id, anekdot_id) {
    let client = await this.DB.connect();
    try {
      const countResult = await client.query(`SELECT * from anekdot WHERE id = $1`, [anekdot_id]);
      if (!countResult.rowCount) throw new _Errors.NOAnekdotError();
      const query = `
            DELETE FROM favourites
            WHERE userid = $1 AND anekdotid = $2`;
      await client.query(query, [user_id, anekdot_id]);
    } finally {
      client.release();
    }
  }
  async get_part(user_id, page = 1, limit = 10) {
    if (page < 1 || limit < 1) throw new _Errors.PaginationError();
    let client = await this.DB.connect();
    try {
      const offset = (page - 1) * limit;
      const countResult = await client.query(`SELECT COUNT(*) FROM favourites WHERE userid = $1`, [user_id]);
      const totalCount = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalCount / limit);
      if (page > totalPages && totalPages > 0) {
        throw new _Errors.PaginationError();
      }
      const query = `
                SELECT a.id, a.content, a.hasbadwords, a.loaddate
                FROM anekdot a
                         JOIN favourites f ON a.id = f.anekdotid
                WHERE f.userid = $1
                LIMIT $2 OFFSET $3`;
      const res = await client.query(query, [user_id, limit, offset]);
      return res.rows.map(row => new _anekdot.Anekdot(row.content, row.hasbadwords, row.loaddate, row.id));
    } finally {
      client.release();
    }
  }
}) || _class) || _class) || _class) || _class);