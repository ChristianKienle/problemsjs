// @flow
'use strict';

const TermKit = require( 'terminal-kit' );
const { openInEditor } = require('./editor');
const TerminalUI = require('./terminal-ui/ui-impl-termkit');
const SystemTerminalUI = require('./terminal-ui/ui/terminal-ui-impl');
const log = require('cmklog');

/*::
type RenderInfoItem = Problem | string;
type RenderInfo = Map<number, RenderInfoItem>; //{ [lineNumber: number]: RenderInfoItem };
type CLIOptions = {
  workspaceFolder?: string;
  openInEditorCommand?: string;
};
*/

class CLI /*:: implements ProblemsDelegate */ {
  /*::
  _terminal: TerminalUIInterface;
  _background: any;
  _problemBuffers: any[];
  _ui: TerminalUI;
  _openInEditorCommand: ?string;
  */
  constructor({ workspaceFolder = process.cwd(), openInEditorCommand } /*: CLIOptions */ = { }) {
    this._problemBuffers = [];
    this._openInEditorCommand = openInEditorCommand;
    const term = TermKit.terminal;
    this._terminal = new SystemTerminalUI(term);
    this._ui = new TerminalUI({ui: this._terminal, workspaceFolder });
    this._ui.setProblemSelectionHandler((problem) => {
      this.didSelectItem(problem);
    });
  }

  didSelectItem(item /*: RenderInfoItem */) /*: void */ {
    const template = this._openInEditorCommand;
    if(template == null || template === undefined) {
      log.info('Cannot open item because no openInEditorCommand has been specified.');
      return;
    }
    if(typeof item === 'string') {
      openInEditor({template, location: item});
      return;
    }
    const problem = item;
    const absolutePath = problem.location.source;
    const line = problem.location.line;
    openInEditor({template, location: {absolutePath, line}});
  }

  // ProblemsDelegate
  didEndRun(results /*: MatcherResult[] */) {
    this._ui.didEndRun(results);
  }

  willBeginRun() {
    this._ui.willBeginRun();
  }

  willExecuteTask(task /*: TaskConfig */) {
    this._ui.willExecuteTask(task);
  }

  didExecuteTask() {
    this._ui.didExecuteTask();
  }

}

module.exports = CLI;
