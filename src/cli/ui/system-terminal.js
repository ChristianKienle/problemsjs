// @flow
'use strict';

const { Rect } = require('./geometry');

class SystemTerminal /*:: implements TerminalUIInterface */ {
  /*::
  _t: any;
  */

  // term: instance from terminal kit
  constructor(term /*: any */) {
    this._t = term;
  }

  get t() { return this._t; }

  text(text /*: string */) {
    this.t(text);
  }

  eraseRect({ origin, size } /*: UI$Rect */)/*: void */ {
    const { width, height, x, y } = { ...origin, ...size };
    this.t.styleReset();
    this.t.eraseArea(x, y, width, height);
  }

  eraseLine() {
    this.t.eraseLine();
  }

  clear() {
    this.t.clear();
  }

  processExit(exitCode /*: number */ = 0) {
    this.t.processExit(exitCode);
  }

  moveTo({ x, y } /*: UI$Point */) /*: void */ {
    this.t.moveTo(x, y);
  }

  moveToNextLine() {
    this.t.nextLine();
  }

  saveCursor() /*: void */ {
    this.t.saveCursor();
  }

  restoreCursor() /*: void */ {
    this.t.restoreCursor();
  }

  styleReset() /*: void */ {
    this.t.styleReset();
  }

  defaultColor(text /*: string */) {
    this.t.defaultColor(text);
  }

  setFullScreenEnabled(fullscreen /*: boolean */) {
    this.t.fullscreen(fullscreen);
  }

  setGrabInputEnabled(grab /*: boolean */) {
    this.t.grabInput(grab);
  }

  setCursorVisible(visible /*: boolean */) {
    this.t.hideCursor(!visible);
  }

  setWindowTitle(title /*: string */) {
    this.t.windowTitle(title);
  }

  onResize(cb /*: () => void */) {
    this.t.on('resize', cb);
  }

  onRawKeyEvent(cb /*: (name: string) => void */) {
    this.t.on('key', (name) => cb(name));
  }

  // Styles
  setDimmed(dimmed /*: boolean */) {
    this.t.dim(dimmed);
  }
  setInverse(inverse /*: boolean*/) {
    this.t.inverse(inverse);
  }

  setBold(bold /*: boolean*/) {
    this.t.bold(bold);
  }

  setForegroundColor(hex /*: string */) /*: void */ {
    this.t.colorRgbHex(hex);
  }

  setForegroundColorBlue(enabled /*: boolean */) /*: void */ {
    this.t.blue(enabled);
  }

  setForegroundColorWhite(enabled /*: boolean */) /*: void */ {
    this.t.white(enabled);
  }

  setForegroundColorGreen(enabled /*: boolean */) /*: void */ {
    this.t.green(enabled);
  }

  setForegroundColorRed(enabled /*: boolean */) /*: void */ {
    this.t.red(enabled);
  }

  setForegroundColorGray(enabled /*: boolean */) /*: void */ {
    this.t.gray(enabled);
  }

  setBackgroundRed(enabled /*: boolean */) /*: void */ {
    this.t.bgRed(enabled);
  }

  setBackgroundGray(enabled /*: boolean */) /*: void */ {
    this.t.bgGray(enabled);
  }

  setBackgroundGreen(enabled /*: boolean */) /*: void */ {
    this.t.bgGreen(enabled);
  }

  setBackgroundBrightWhite(enabled /*: boolean */) /*: void */ {
    this.t.bgBrightWhite(enabled);
  }

  // Layout
  get frame() /*: Rect */ {
    return Rect.from({ x: 1, y: 1, width: this.width, height: this.height });
  }

  get width() /*: number */ {
    return this.t.width;
  }

  get height() /*: number */ {
    return this.t.height;
  }
}

module.exports = SystemTerminal;
