"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ISiteParser = exports.AnekdotovStreetParser = exports.AnekdotRuParser = void 0;
var _inversify = require("inversify");
var cheerio = _interopRequireWildcard(require("cheerio"));
var _logger = require("./logger");
var _dec, _dec2, _dec3, _class, _dec4, _dec5, _dec6, _class2;
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
class ISiteParser {
  constructor(selector, url) {
    this.selector = selector;
    this.url = url;
  }
  parse(data) {
    const $ = cheerio.load(data);
    const anekdot = $(this.selector);
    if (!anekdot.length) {
      const msg = `Не найдена структура анекдота на странице`;
      _logger.logger.warn(msg);
      throw new Error(msg);
    }
    return anekdot.text().replace(/\n/g, ' ').trim();
  }
}
exports.ISiteParser = ISiteParser;
let AnekdotRuParser = exports.AnekdotRuParser = (_dec = (0, _inversify.injectable)(), _dec2 = Reflect.metadata("design:type", Function), _dec3 = Reflect.metadata("design:paramtypes", []), _dec(_class = _dec2(_class = _dec3(_class = class AnekdotRuParser extends ISiteParser {
  constructor() {
    super('div.a_id_item[data-t="j"] div.text', 'anekdot.ru');
  }
}) || _class) || _class) || _class);
let AnekdotovStreetParser = exports.AnekdotovStreetParser = (_dec4 = (0, _inversify.injectable)(), _dec5 = Reflect.metadata("design:type", Function), _dec6 = Reflect.metadata("design:paramtypes", []), _dec4(_class2 = _dec5(_class2 = _dec6(_class2 = class AnekdotovStreetParser extends ISiteParser {
  constructor() {
    super('div.anekdot-text > p', 'anekdotovstreet.com');
  }
}) || _class2) || _class2) || _class2);