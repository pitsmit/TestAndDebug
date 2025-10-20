"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserManager = void 0;
var _inversify = require("inversify");
var _IUserFavouritesRepository = require("../../Repository/Interfaces/IUserFavouritesRepository");
var _anekdot = require("./anekdot");
var _jwt = require("../Services/jwt");
var _roles = require("../../shared/types/roles");
var _dec, _dec2, _dec3, _dec4, _dec5, _class;
let UserManager = exports.UserManager = (_dec = (0, _inversify.injectable)(), _dec2 = function (target, key) {
  return (0, _inversify.inject)("IUserFavouritesRepository")(target, undefined, 0);
}, _dec3 = function (target, key) {
  return (0, _inversify.inject)("IAuthService")(target, undefined, 1);
}, _dec4 = Reflect.metadata("design:type", Function), _dec5 = Reflect.metadata("design:paramtypes", [typeof _IUserFavouritesRepository.IUserFavouritesRepository === "undefined" ? Object : _IUserFavouritesRepository.IUserFavouritesRepository, typeof _jwt.IAuthService === "undefined" ? Object : _jwt.IAuthService]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = _dec5(_class = class UserManager {
  constructor(_favouritesRepository, _authService) {
    this._favouritesRepository = _favouritesRepository;
    this._authService = _authService;
  }
  async AddToFavourites(token, anekdot_id) {
    this._authService.checkRole(token, _roles.ROLE.USER);
    const {
      id
    } = this._authService.verifyToken(token);
    const {
      content,
      hasBadWords,
      lastModifiedDate
    } = await this._favouritesRepository.add(id, anekdot_id);
    return new _anekdot.Anekdot(content, hasBadWords, lastModifiedDate, anekdot_id);
  }
  async DeleteFromFavourites(token, anekdot_id) {
    this._authService.checkRole(token, _roles.ROLE.USER);
    const {
      id
    } = this._authService.verifyToken(token);
    await this._favouritesRepository.remove(id, anekdot_id);
  }
  async ShowFavourites(token, page, limit = 10) {
    this._authService.checkRole(token, _roles.ROLE.USER);
    const {
      id
    } = this._authService.verifyToken(token);
    return await this._favouritesRepository.get_part(id, page, limit);
  }
}) || _class) || _class) || _class) || _class) || _class);