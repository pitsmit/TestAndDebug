"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AdminManager = void 0;
var _inversify = require("inversify");
var _IAnekdotRepository = require("../../Repository/Interfaces/IAnekdotRepository");
var _anekdot = require("./anekdot");
var _anekdotPropertiesExtractor2 = require("../Services/anekdotPropertiesExtractor");
var _jwt = require("../Services/jwt");
var _roles = require("../../shared/types/roles");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class;
let AdminManager = exports.AdminManager = (_dec = (0, _inversify.injectable)(), _dec2 = function (target, key) {
  return (0, _inversify.inject)("IAnekdotRepository")(target, undefined, 0);
}, _dec3 = function (target, key) {
  return (0, _inversify.inject)(_anekdotPropertiesExtractor2.AnekdotPropertiesExtractor)(target, undefined, 1);
}, _dec4 = function (target, key) {
  return (0, _inversify.inject)("IAuthService")(target, undefined, 2);
}, _dec5 = Reflect.metadata("design:type", Function), _dec6 = Reflect.metadata("design:paramtypes", [typeof _IAnekdotRepository.IAnekdotRepository === "undefined" ? Object : _IAnekdotRepository.IAnekdotRepository, typeof _anekdotPropertiesExtractor2.AnekdotPropertiesExtractor === "undefined" ? Object : _anekdotPropertiesExtractor2.AnekdotPropertiesExtractor, typeof _jwt.IAuthService === "undefined" ? Object : _jwt.IAuthService]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = _dec5(_class = _dec6(_class = class AdminManager {
  constructor(_anekdotRepository, _anekdotPropertiesExtractor, _authService) {
    this._anekdotRepository = _anekdotRepository;
    this._anekdotPropertiesExtractor = _anekdotPropertiesExtractor;
    this._authService = _authService;
  }
  async LoadAnekdot(token, data) {
    this._authService.checkRole(token, _roles.ROLE.ADMIN);
    const {
      text,
      hasBadWords,
      lastModifiedDate
    } = await this._anekdotPropertiesExtractor.extract(data);
    const id = await this._anekdotRepository.load(text, hasBadWords, lastModifiedDate);
    return new _anekdot.Anekdot(text, hasBadWords, lastModifiedDate, id);
  }
  async DeleteAnekdot(token, id) {
    this._authService.checkRole(token, _roles.ROLE.ADMIN);
    await this._anekdotRepository.delete(id);
  }
  async EditAnekdot(token, id, new_text) {
    this._authService.checkRole(token, _roles.ROLE.ADMIN);
    const {
      text,
      hasBadWords,
      lastModifiedDate
    } = await this._anekdotPropertiesExtractor.extract(new_text);
    await this._anekdotRepository.edit(id, text, hasBadWords, lastModifiedDate);
    return new _anekdot.Anekdot(text, hasBadWords, lastModifiedDate, id);
  }
}) || _class) || _class) || _class) || _class) || _class) || _class);