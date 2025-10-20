"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HTMLLoader = void 0;
var _axios = _interopRequireDefault(require("axios"));
var _logger = require("./logger");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class HTMLLoader {
  async getHTML(url) {
    const source = _axios.default.CancelToken.source();
    const timeout = setTimeout(() => source.cancel('Timeout'), 5000);
    try {
      return (await _axios.default.get(url, {
        cancelToken: source.token,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        }
      })).data;
    } catch (error) {
      source.cancel('Request failed');
      _logger.logger.error(error.message);
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
exports.HTMLLoader = HTMLLoader;