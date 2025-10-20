"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PersonFabric = void 0;
var _inversify = require("inversify");
var _jwt = require("./jwt");
var _person = require("../Essences/person");
var _IPersonRepository = require("../../Repository/Interfaces/IPersonRepository");
var _dec, _dec2, _dec3, _dec4, _class;
let PersonFabric = exports.PersonFabric = (_dec = function (target, key) {
  return (0, _inversify.inject)("IPersonRepository")(target, undefined, 0);
}, _dec2 = function (target, key) {
  return (0, _inversify.inject)("IAuthService")(target, undefined, 1);
}, _dec3 = Reflect.metadata("design:type", Function), _dec4 = Reflect.metadata("design:paramtypes", [typeof _IPersonRepository.IPersonRepository === "undefined" ? Object : _IPersonRepository.IPersonRepository, typeof _jwt.IAuthService === "undefined" ? Object : _jwt.IAuthService]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = class PersonFabric {
  constructor(_personrepository, _authService) {
    this._personrepository = _personrepository;
    this._authService = _authService;
  }
  async get(login, password) {
    const {
      role,
      id,
      name
    } = await this._personrepository.get(login, password);
    const token = this._authService.generateToken(id, role);
    return new _person.Person(token, name, role);
  }
  async create(login, password, name, role) {
    const id = await this._personrepository.create(login, password, name, role);
    const token = this._authService.generateToken(id, role);
    return new _person.Person(token, name, role);
  }
}) || _class) || _class) || _class) || _class);