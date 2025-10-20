"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Anekdot = void 0;
class Anekdot {
  constructor(text, hasBadWords, lastModifiedDate, id) {
    this.text = text;
    this.hasBadWords = hasBadWords;
    this.lastModifiedDate = lastModifiedDate;
    this.id = id;
  }
}
exports.Anekdot = Anekdot;