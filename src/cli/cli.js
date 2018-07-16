// @flow
'use strict';

const TermKit = require( 'terminal-kit' );
const { openInEditor } = require('./editor');
const { MainView } = require('./ui');
const SystemTerminalUI = require('./ui/system-terminal');
const log = require('cmklog');

/*::
type CLIOptions = {
  openInEditorCommand?: string;
};
*/

class CLI /*:: implements EmitterDelegate */ {
  /*::
  _mainView: MainView;
  _openInEditorCommand: ?string;
  */
  constructor({ openInEditorCommand } /*: CLIOptions */ = { }) {
    this._openInEditorCommand = openInEditorCommand;
    this._mainView = new MainView({ ui: new SystemTerminalUI(TermKit.terminal) });
    this._mainView.setProblemSelectionHandler(problem => { this._didSelectProblem(problem); });
    this._mainView.setSourceSelectionHandler(source => { this._didSelectSourceFile(source); });
  }

  _openFile(absolutePath /*: string */, line /*: number */ = 1) {
    const template = this._openInEditorCommand;
    if(template == null || template === undefined) {
      log.info('Cannot open item because no openInEditorCommand has been specified.');
      return;
    }
    openInEditor({template, location: {absolutePath, line}});
  }

  _didSelectSourceFile(file /*: string */) /*: void */ {
    this._openFile(file);
  }

  _didSelectProblem(problem /*: Problem */) /*: void */ {
    const { source, line } = problem.location;
    this._openFile(source, line);
  }

  // ProblemsDelegate
  didEndRun(run /*: RunInterface */) {
    this._mainView.didEndRun(run);
  }

  willBeginRun() {
    this._mainView.willBeginRun();
  }

  willExecuteTask(task /*: TaskConfig */) {
    this._mainView.willExecuteTask(task);
  }

  didExecuteTask() {
    this._mainView.didExecuteTask();
  }
}

module.exports = CLI;
