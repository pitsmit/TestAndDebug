"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AuthService = void 0;
var _inversify = require("inversify");
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
var _logger = require("./logger");
var _Errors = require("../Essences/Errors");
var _dec, _class;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
let AuthService = exports.AuthService = (_dec = (0, _inversify.injectable)(), _dec(_class = class AuthService {
  generateToken(id, role) {
    return _jsonwebtoken.default.sign({
      id,
      role
    }, process.env.JWT_SECRET, {
      expiresIn: '30d',
      algorithm: 'HS512'
    });
  }
  verifyToken(token) {
    let decoded;
    try {
      decoded = _jsonwebtoken.default.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      const msg = `Некорректный токен`;
      if (typeof decoded !== 'object' || decoded === null || !('id' in decoded) || !('role' in decoded)) {
        _logger.logger.error(msg);
        throw new _Errors.BadTokenError();
      }
    }
    return {
      id: decoded.id,
      role: decoded.role
    };
  }
  checkRole(token, expected_role) {
    const {
      role
    } = this.verifyToken(token);
    if (role !== expected_role) {
      _logger.logger.error("Недостаточно прав");
      throw new _Errors.PermissionError();
    }
  }
}) || _class);