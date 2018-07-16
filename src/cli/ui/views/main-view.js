// @flow
'use strict';
const { Rect } = require('./../geometry');

const StatusBar = require('./status-bar');
const TableView = require('./table-view');

/*::
import type { OutlineModelEntry } from './outline-model';
import type { Row, Section } from './table-view';
*/

const { OutlineModel } = require('./outline-model');

// Layout Helper
const Layout = {
  problem: {
    height: 1,
    indent: {
      left: 1,
      right: 1,
    },
  },
  section: {
    height : 2,
    spacing: 1,
  },
};

/*::
type SectionsFromEntriesOptions = {
  onPrimaryProblemAction: ProblemSelectionHandler;
  onPrimarySourceAction: SourceSelectionHandler;
};
*/
const rowFromProblem = (problem /*: Problem */, problemActionHandler /*: ProblemSelectionHandler */) /*: Row */ => {
  return {
    render: ({ isSelected, frame, ui }) => {
      const { message, category } = problem;
      const { origin } = frame;
      ui.styleReset();
      ui.eraseRect(frame);
      ui.moveTo(origin);
      const { indent } = Layout.problem;
      const { left: leftIndent, right: rightIndent } = indent;
      ui.text(' '.repeat(leftIndent));
      const renderedCategory = `[${category}] `;
      const maxWidth = ui.width - (leftIndent + rightIndent + renderedCategory.length);
      const renderedMessage = clippedString(message, maxWidth);
      ui.setInverse(isSelected);
      ui.setDimmed(true);
      ui.text(`[${category}] `);
      ui.setDimmed(false);
      ui.text(renderedMessage);
    },
    onPrimaryAction: () => { problemActionHandler(problem); },
  };
};

const sectionFromEntry = (entry /*: OutlineModelEntry */, options /*: SectionsFromEntriesOptions */) /*: Section */ => {
  const rows = entry.problems.map(problem => rowFromProblem(problem, options.onPrimaryProblemAction));
  return {
    rows,
    title: entry.relativePath,
    onPrimaryAction: () => { options.onPrimarySourceAction(entry.absolutePath); },
  };
};

const sectionsFromEntries = (entries /*: OutlineModelEntry[] */, options /*: SectionsFromEntriesOptions */) /*: Section[] */ => {
  return entries.map(entry => sectionFromEntry(entry, options));
};

// String Helper
function clippedString(text /*: string */, maxLength /*: number */) /*: string */ {
  const { length } = text;
  if(maxLength <= 0) {
    return '';
  }
  if(length <= maxLength) {
    return text;
  }
  const clipChar = '…';
  const endIndex = (maxLength - 1) - clipChar.length;
  return `${text.substring(0, endIndex)}${clipChar}`;
}

/*::
type ProblemSelectionHandler = (problem: Problem) => void;
type SourceSelectionHandler = (file: string) => void;
type TerminalUIOptions = { ui: TerminalUIInterface };
*/
class MainView /*:: implements EmitterDelegate */ {
  /*::
  _table: ?TableView;
  _ui: TerminalUIInterface;
  _problemSelectionHandler: ProblemSelectionHandler;
  _sourceSelectionHandler: SourceSelectionHandler;
  _statusBar: StatusBar;
  _model: OutlineModel;
  */

  constructor({ ui } /*: TerminalUIOptions */) {
    this._table = undefined;
    this._ui = ui;
    this._statusBar = new StatusBar(ui);
    this._model = new OutlineModel([]);

    this._problemSelectionHandler = () => {};
    this._sourceSelectionHandler = () => {};

    ui.setFullScreenEnabled(true);
    ui.setGrabInputEnabled(true);

    ui.onResize(() => {
      this.render();
    });

    ui.onRawKeyEvent((name) => {
      this.onKey(name);
    });

    ui.setCursorVisible(false);
    this._scheduleStatusBarDrawingLoop();
  }

  // ProblemsAPIDelegate
  willExecuteTask(task /*: TaskConfig */) /*: void */ {
    this._statusBar.willExecuteTask(task);
  }

  didExecuteTask() /*: void */ {
    this._statusBar.didExecuteTask();
  }

  willBeginRun() /*: void */ {
    this._statusBar.willBeginRun();
  }

  didEndRun(run /*: RunInterface */) /*: void */ {
    this._model = OutlineModel.fromRun(run);
    this._statusBar.didEndRun(run);
    this.render();
  }

  // Impl.
  setProblemSelectionHandler(didSelect /*: ProblemSelectionHandler */) {
    this._problemSelectionHandler = didSelect;
  }
  setSourceSelectionHandler(didSelect /*: SourceSelectionHandler */) {
    this._sourceSelectionHandler = didSelect;
  }

  onKey(key /*: string */) {
    const term = this._ui;
    switch(key) {
    case 'ENTER': {
      const table = this._table;
      if(table != null) {
        table.triggerPrimaryActionForSelection();
      }
      break;
    }
    case 'UP': {
      const table = this._table;
      if(table != null && table !== undefined) {
        table.selectPrevious();
      }
      break;
    }
    case 'DOWN': {
      const table = this._table;
      if(table != null && table !== undefined) {
        table.selectNext();
      }
      break;
    }
    case 'CTRL_C': {
      term.clear();
      term.setCursorVisible(true);
      term.processExit(0);
      return; // do not remove - otherwise term.processExit does strange things.
    }
    default: break;
    }
  }

  _scheduleStatusBarDrawingLoop() {
    setTimeout(() => {
      this._renderStatusBar();
      this._scheduleStatusBarDrawingLoop();
    }, 1000);
  }

  _renderStatusBar() {
    const t = this._ui;
    t.styleReset();
    const y = t.height;
    t.saveCursor();
    t.moveTo({ x: 1, y: y + 1 });
    t.eraseLine();
    this._statusBar.render();
    t.restoreCursor();
  }

  renderEmptyState() {
    const t = this._ui;
    t.styleReset();
    const text = 'No Problems Found.';
    const y = t.height / 2;
    const x = 0.5 * (t.width - text.length);
    t.saveCursor();
    t.moveTo({x, y});
    t.defaultColor(text);
    t.restoreCursor();
  }

  _problemsViewFrame() /*: Rect */ {
    const MARGIN = {
      left: 1,
      right: 1,
      top: 1,
      bottom: 2,
    };

    const { origin, size } = this._ui.frame;
    const { x, y } = origin;
    const { width, height } = size;

    const result = Rect.from({
      x: x + MARGIN.left,
      y: y + MARGIN.top,
      width: width - (MARGIN.left + MARGIN.right),
      height: height - (MARGIN.top + MARGIN.bottom),
    });

    return result;
  }

  render() {
    const ui = this._ui;
    ui.styleReset();
    ui.setWindowTitle('');
    ui.clear();

    const model = this._model;

    if(model.problemsCount === 0) {
      this.renderEmptyState();
      this._renderStatusBar();
      return;
    }

    const tableFrame = this._problemsViewFrame();
    const table = new TableView({ frame: tableFrame, ui });

    const options /*: SectionsFromEntriesOptions */ = {
      onPrimaryProblemAction: this._problemSelectionHandler,
      onPrimarySourceAction: this._sourceSelectionHandler,
    };

    const sections = sectionsFromEntries(model.entries, options);
    sections.forEach(section => table.addSection(section));
    this._table = table;
    ui.eraseRect(tableFrame);
    table.render();
    this._renderStatusBar();
  }
}

module.exports = MainView;
