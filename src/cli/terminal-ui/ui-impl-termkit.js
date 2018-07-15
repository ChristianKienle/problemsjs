// @flow
'use strict';
const { Rect, Point, Size } = require('./geometry');

const StatusBar = require('./ui/status-bar');
const StackView = require('./ui/stack-view');

/*::
import type { OutlineModelEntry } from './outline-model';
*/

const Path = require('path');
const { OutlineModel } = require('./outline-model');

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
type UI$RenderRequest = {
  isSelected:boolean;
  frame: UI$Rect;
  problem: Problem;
};

type UI$RenderSectionHeaderRequest = {
  isSelected:boolean;
  frame: UI$Rect;
  absolutePath: string;
};

type ProblemSelectionHandler = (problem: Problem) => void;
type TerminalUIOptions = {
  ui: TerminalUIInterface;
  workspaceFolder: string;
};
*/
class TerminalUI /*:: implements ProblemsDelegate */ {
  /*::
  _stack: ?StackView;
  _ui: TerminalUIInterface;
  _results: MatcherResult[];
  _problems: Problem[];
  _problemSelectionHandler: ProblemSelectionHandler;
  _statusBar: StatusBar;
  _workspaceFolder: string;
  */

  constructor({
    ui,
    workspaceFolder,
  } /*: TerminalUIOptions */) {
    this._stack = undefined;
    this._ui = ui;
    this._statusBar = new StatusBar(ui);
    this._problems = [];
    this._results = [];
    this._workspaceFolder = workspaceFolder;
    this._problemSelectionHandler = () => {};
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
  didEndRun(results /*: MatcherResult[] */) /*: void */ {
    this._results = results;
    this._problems = (results.map(res => res.problems).reduce((total, amount) => {
      return total.concat(amount);
    }, []));
    this._statusBar.didEndRun(results);
    this.render();
  }

  // Impl.
  _renderProblem({ isSelected, frame, problem } /*: UI$RenderRequest */) {
    const t = this._ui;
    const { origin } = frame;
    t.styleReset();
    t.eraseRect(frame);
    t.moveTo(origin);

    const { message, category } = problem;
    const { indent } = Layout.problem;
    const leftIndentAmount = indent.left;
    const rightIndentAmount = indent.left;

    t.text(' '.repeat(leftIndentAmount));
    const renderedCategory = `[${category}] `;
    const maxWidth = t.width - (leftIndentAmount + rightIndentAmount + renderedCategory.length);
    const renderedMessage = clippedString(message, maxWidth);
    t.setInverse(isSelected);
    t.setDimmed(true);
    t.text(`[${category}] `);
    t.setDimmed(false);
    t.text(renderedMessage);
  }

  _renderSectionHeader({ isSelected, frame, absolutePath } /*: UI$RenderSectionHeaderRequest */) {
    const t = this._ui;
    const { origin } = frame;
    t.styleReset();
    t.eraseRect(frame);
    t.moveTo(origin);
    const rootPath = this._workspaceFolder;
    const relativeFile = Path.relative(rootPath, absolutePath);
    t.text(' ');
    t.setBold(true);
    t.setInverse(isSelected);
    t.text(relativeFile);

    const hr = '┈'.repeat(t.width);
    t.setInverse(false);
    t.moveToNextLine();
    t.text('');
    t.setDimmed(true);
    t.text(hr);
    t.styleReset();
  }

  setProblemSelectionHandler(didSelect /*: ProblemSelectionHandler */) {
    this._problemSelectionHandler = didSelect;
  }

  onKey(key /*: string */) {
    const term = this._ui;
    switch(key) {
    case 'ENTER': {
      const stack = this._stack;
      if(stack != null) {
        stack.triggerPrimaryActionForSelection();
      }
      break;
    }
    case 'UP': {
      const stack = this._stack;
      if(stack != null && stack !== undefined) {
        stack.selectPrevious();
      }
      break;
    }
    case 'DOWN': {
      const stack = this._stack;
      if(stack != null && stack !== undefined) {
        stack.selectNext();
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
    const t = this._ui;
    t.styleReset();
    t.setWindowTitle('');
    t.clear();

    const model = new OutlineModel(this._problems);
    if(model.problemsCount === 0) {
      this.renderEmptyState();
      this._renderStatusBar();
      return;
    }

    const SECTION_HEIGHT = 2;
    const ROW_HEIGHT = 1;
    const SECTION_SPACING = 1;
    const stackFrame = this._problemsViewFrame();
    const stack = new StackView(stackFrame, this._ui);
    this._stack = stack;
    const ui = this._ui;
    ui.eraseRect(stackFrame);

    let currentLine = stackFrame.origin.y;
    const stackX = stackFrame.origin.x;

    // const headerFrame = Rect.from({ width: stackFrame.width, x: stackFrame.origin.x, y: currentLine, height: 3 });
    // stack.add({
    //   render: () => {
    //     ui.styleReset();
    //     ui.eraseRect(headerFrame);
    //     ui.moveTo(headerFrame.origin);
    //     ui.text('hello world');
    //   },
    //   onPrimaryAction: () => {},
    // });
    // currentLine += 3;

    model.entries.forEach(entry => {
      // Add the section header
      const sectionOrigin = new Point({ x: stackX, y: currentLine });
      const sectionSize = new Size({ width: stackFrame.width, height: SECTION_HEIGHT });
      const sectionFrame = new Rect({ size: sectionSize, origin: sectionOrigin });
      stack.add({
        render: (isSelected) => {
          this._renderSectionHeader({isSelected, frame: sectionFrame, absolutePath: entry.absolutePath});
        },
        onPrimaryAction: () => {},
      });
      currentLine += SECTION_HEIGHT;

      // Add the rows
      const { problems } = entry;
      problems.forEach(problem => {
        const problemOrigin = new Point({ x: stackX, y: currentLine });
        const problemSize = new Size({ width: stackFrame.width, height: ROW_HEIGHT });
        const problemFrame = new Rect({ size: problemSize, origin: problemOrigin });
        stack.add({
          render: (isSelected) => {
            this._renderProblem({isSelected, frame: problemFrame, problem});
          },
          onPrimaryAction: () => {
            this._problemSelectionHandler(problem);
          },
        });
        currentLine += ROW_HEIGHT;
      });

      currentLine += SECTION_SPACING;
    });

    stack.render();
    this._renderStatusBar();
  }

  // Status related
  didFinishRun() {
    this._statusBar.lastRun = new Date(Date.now());
    const summaries /*: string[] */ = [];
    this._results.forEach((result) => {
      const { summary } = result;
      if(summary != null) {
        summaries.push(summary);
      }
    });
    this._statusBar._results = this._results;
    this._renderStatusBar();
  }
}

module.exports = TerminalUI;
