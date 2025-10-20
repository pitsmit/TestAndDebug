"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AnekdotPropertiesExtractor = void 0;
var _HTMLLoader = require("./HTMLLoader");
var _inversify = require("inversify");
var _logger = require("./logger");
var _INonStandartLexicRepository = require("../../Repository/Interfaces/INonStandartLexicRepository");
var _dec, _dec2, _dec3, _dec4, _class;
let AnekdotPropertiesExtractor = exports.AnekdotPropertiesExtractor = (_dec = (0, _inversify.injectable)(), _dec2 = function (target, key) {
  return (0, _inversify.inject)("INonStandartLexicRepository")(target, undefined, 0);
}, _dec3 = Reflect.metadata("design:type", Function), _dec4 = Reflect.metadata("design:paramtypes", [typeof _INonStandartLexicRepository.INonStandartLexicRepository === "undefined" ? Object : _INonStandartLexicRepository.INonStandartLexicRepository, Array]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = class AnekdotPropertiesExtractor {
  constructor(_lexicRepo, parsers = []) {
    this._lexicRepo = _lexicRepo;
    this.parsers = parsers;
  }
  async createFromText(text) {
    const hasBadWords = await this._lexicRepo.containsBadWords(text);
    const lastModifiedDate = new Date();
    return {
      text,
      hasBadWords,
      lastModifiedDate
    };
  }
  async createFromUrl(url) {
    const html = await new _HTMLLoader.HTMLLoader().getHTML(url);
    const parser = this.parsers.find(p => url.includes(p.url));
    if (!parser) {
      const msg = `Парсер для URL ${url} не найден`;
      _logger.logger.warn(msg);
      throw new Error(msg);
    }
    return this.createFromText(parser.parse(html));
  }
  async extract(data) {
    try {
      new URL(data);
      return await this.createFromUrl(data);
    } catch {
      return await this.createFromText(data);
    }
  }
}) || _class) || _class) || _class) || _class);