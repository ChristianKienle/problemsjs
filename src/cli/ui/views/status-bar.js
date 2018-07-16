// @flow
'use strict';

const differenceInSeconds = require('date-fns/differenceInSeconds');
const MAX_LAST_RUN_WIDTH = '       Last Run: 999s ago'.length;
const { Rect } = require('./../geometry');
const Path = require('path');

const _taskNameFromTask = ({name, program} /*: TaskConfig */) /*: string */ => {
  if(name != null) {
    return name;
  }
  return Path.basename(program);
};

class StatusBar /*:: implements EmitterDelegate */ {
  /*::
  lastRun: ?Date;
  _results: MatcherResult[];
  _ui: TerminalUIInterface;
  _executingTask: ?TaskConfig;
  _isRunning: boolean;
  */

  constructor(ui /*: TerminalUIInterface */) {
    this._ui = ui;
    this.lastRun = undefined;
    this._results = [];
    this._isRunning = false;
    this._executingTask = undefined;
  }

  // Layout
  get __fullAccessoryFrame() /*: Rect */ {
    const t = this._ui;
    const x = t.width - MAX_LAST_RUN_WIDTH;
    const y = t.height;
    return Rect.from({ width: MAX_LAST_RUN_WIDTH, height: 1, x, y});
  }

  _renderAccessory() {
    const t = this._ui;
    t.saveCursor();
    t.styleReset();
    const frame = this.__fullAccessoryFrame;
    const { origin } = frame;
    t.eraseRect(frame);
    t.moveTo(origin);
    if(this._isRunning) {
      this._renderExecutingTask();
    } else {
      this._renderLastRun();
    }
    t.restoreCursor();
  }

  // ProblemsAPIDelegate
  willExecuteTask(task /*: TaskConfig */) /*: void */ {
    this._executingTask = task;
    this._renderAccessory();
  }

  didExecuteTask() /*: void */ {
    this._executingTask = undefined;
    this._renderAccessory();
  }

  willBeginRun() /*: void */ {
    this._isRunning = true;
    this._renderAccessory();
  }

  didEndRun({ results } /*: RunInterface */) /*: void */ {
    this._results = results;
    this._isRunning = false;
    this.lastRun = new Date(Date.now());
  }

  // Properties
  get lastRunForDisplay() /*: string */ {
    const lastRun = this.lastRun;
    if(lastRun == null || lastRun === undefined) {
      return 'never';
    }
    const now = new Date(Date.now());
    const seconds = differenceInSeconds(now, lastRun);
    return `Last Run: ${seconds}s ago`;
  }

  // Render
  _renderExecutingTask() {
    const task = this._executingTask;
    if(task == null || task === undefined) {
      return;
    }
    const taskName = _taskNameFromTask(task);
    const name = ` ${taskName} `;
    const t = this._ui;
    t.styleReset();
    const frame = this.__fullAccessoryFrame;
    const delta = (frame.size.width - name.length);
    const x = frame.origin.x + delta;
    const y = frame.origin.y;
    t.moveTo({ x, y });
    t.setForegroundColorBlue(true);
    t.setInverse(true);
    t.text(name);
  }

  _renderLastRun() {
    const t = this._ui;
    t.styleReset();
    const text = `${this.lastRunForDisplay}`;
    const frame = this.__fullAccessoryFrame;
    const delta = (frame.size.width - text.length);
    const x = frame.origin.x + delta;
    const y = frame.origin.y;
    t.moveTo({x, y});
    t.setDimmed(true);
    t.text(text);
  }

  _renderSummaryOfResult(result /*: MatcherResult */) {
    const t = this._ui;
    t.styleReset();
    const { summaryRenderer } = result;
    if(summaryRenderer != null) {
      summaryRenderer(t);
      t.text(' ');
      return;
    }
    const { summary } = result;
    if(summary != null) {
      t.text(summary);
      t.text(' ');
    }
  }

  render() {
    const t = this._ui;
    t.styleReset();
    this._results.forEach((result) => {
      this._renderSummaryOfResult(result);
    });
    this._renderAccessory();
  }
}

module.exports = StatusBar;
