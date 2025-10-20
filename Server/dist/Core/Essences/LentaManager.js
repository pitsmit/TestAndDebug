"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LentaManager = void 0;
var _IAnekdotRepository = require("../../Repository/Interfaces/IAnekdotRepository");
var _inversify = require("inversify");
var _dec, _dec2, _dec3, _dec4, _class;
let LentaManager = exports.LentaManager = (_dec = (0, _inversify.injectable)(), _dec2 = function (target, key) {
  return (0, _inversify.inject)("IAnekdotRepository")(target, undefined, 0);
}, _dec3 = Reflect.metadata("design:type", Function), _dec4 = Reflect.metadata("design:paramtypes", [typeof _IAnekdotRepository.IAnekdotRepository === "undefined" ? Object : _IAnekdotRepository.IAnekdotRepository]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = class LentaManager {
  constructor(_anekdotRepository) {
    this._anekdotRepository = _anekdotRepository;
  }
  async ShowLenta(page, limit = 10) {
    return await this._anekdotRepository.get_part(page, limit);
  }
}) || _class) || _class) || _class) || _class);