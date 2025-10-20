"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logger = exports.NodeLogger = void 0;
var _fs = _interopRequireDefault(require("fs"));
var _path = _interopRequireDefault(require("path"));
var _pino = _interopRequireDefault(require("pino"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class NodeLogger {
  constructor(appPath) {
    this.logger = void 0;
    const logLevel = this.setUpLogLevel(_path.default.join(appPath, 'config.json'));
    this.logger = (0, _pino.default)({
      level: logLevel,
      timestamp: _pino.default.stdTimeFunctions.isoTime
    }, _pino.default.destination({
      dest: _path.default.join(appPath, 'app.log'),
      mkdir: true
    }));
  }
  setUpLogLevel(configPath) {
    let logLevel = 'info';
    try {
      if (_fs.default.existsSync(configPath)) {
        const config = JSON.parse(_fs.default.readFileSync(configPath, 'utf-8'));
        if (config.logLevel) {
          logLevel = config.logLevel;
        }
      }
    } catch (err) {
      console.error('Ошибка при чтении config.json:', err);
    }
    return logLevel;
  }
  fatal(msg, ...args) {
    this.logger.fatal(msg, ...args);
  }
  error(msg, ...args) {
    this.logger.error(msg, ...args);
  }
  warn(msg, ...args) {
    this.logger.warn(msg, ...args);
  }
  info(msg, ...args) {
    this.logger.info(msg, ...args);
  }
  debug(msg, ...args) {
    this.logger.debug(msg, ...args);
  }
  trace(msg, ...args) {
    this.logger.trace(msg, ...args);
  }
}
exports.NodeLogger = NodeLogger;
const logger = exports.logger = new NodeLogger(process.cwd());