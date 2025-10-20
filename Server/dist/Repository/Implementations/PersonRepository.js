"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PersonRepository = void 0;
var _IDBconnection = require("../Interfaces/IDBconnection");
var _inversify = require("inversify");
var _logger = require("../../Core/Services/logger");
var _Errors = require("../../Core/Essences/Errors");
var _dec, _dec2, _dec3, _class;
let PersonRepository = exports.PersonRepository = (_dec = function (target, key) {
  return (0, _inversify.inject)("IDBconnection")(target, undefined, 0);
}, _dec2 = Reflect.metadata("design:type", Function), _dec3 = Reflect.metadata("design:paramtypes", [typeof _IDBconnection.IDBconnection === "undefined" ? Object : _IDBconnection.IDBconnection]), _dec(_class = _dec2(_class = _dec3(_class = class PersonRepository {
  constructor(DB) {
    this.DB = DB;
  }
  async get(login, password) {
    let client = await this.DB.connect();
    let result;
    try {
      const query = `SELECT * FROM actor WHERE login = $1`;
      result = await client.query(query, [login]);
    } catch (error) {
      throw new _Errors.CredentialsFormatError();
    } finally {
      client.release();
    }
    if (result.rowCount) {
      const person = result.rows[0];
      if (person.password === password) {
        return {
          role: person.role,
          id: person.id,
          name: person.name
        };
      }
      const msg = `Неверный пароль`;
      _logger.logger.error(msg);
      throw new _Errors.CredentialsError(msg);
    }
    const msg = `Пользователь с логином ${login} не найден`;
    _logger.logger.error(msg);
    throw new _Errors.CredentialsError(msg);
  }
  async create(login, password, name, role) {
    let client = await this.DB.connect();
    try {
      await client.query('BEGIN');
      const checkQuery = `
                SELECT
                    EXISTS(SELECT 1 FROM actor WHERE login = $1) as login_exists,
                    EXISTS(SELECT 1 FROM actor WHERE name = $2) as name_exists`;
      const checkResult = await client.query(checkQuery, [login, name]);
      const {
        login_exists,
        name_exists
      } = checkResult.rows[0];
      if (login_exists && name_exists) {
        await client.query('ROLLBACK');
        throw new _Errors.BusyCredentialsError(`Логин "${login}" и имя "${name}" уже заняты`);
      } else if (login_exists) {
        await client.query('ROLLBACK');
        throw new _Errors.BusyLoginError(`Логин "${login}" уже занят`);
      } else if (name_exists) {
        await client.query('ROLLBACK');
        throw new _Errors.BusyNameError(`Имя "${name}" уже занято`);
      }
      const insertQuery = `INSERT INTO actor (login, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id`;
      const result = await client.query(insertQuery, [login, password, name, role]);
      await client.query('COMMIT');
      return result.rows[0].id;
    } finally {
      client.release();
    }
  }
}) || _class) || _class) || _class);