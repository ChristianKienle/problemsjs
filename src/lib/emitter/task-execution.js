// @flow
'use strict';

const log = require('cmklog');
const execa = require('execa');
const assert = require('assert');

/*:: type ExecutionCompletion = (output: string) => void;*/

const executeTask = (task /*: TaskConfig */, cb /*: ExecutionCompletion */) /*: ?child_process$ChildProcess */ => {
  const { program, args } = task;
  try {
    const tenMB = 10000000;
    const cwd = task.cwd || process.cwd();
    const maxBuffer = tenMB * 10; // => 100 MB
    const newProcess = execa(program, args, { cwd, maxBuffer });
    newProcess.then( ({stdout}) => {
      cb(stdout);
    }).catch(error => {
      const { stdout } = error || {};
      if(stdout === undefined) {
        const msg = `Logic error: ${error}.`;
        log.error(msg);
        assert(stdout, msg);
        return;
      }
      cb(stdout);
    });
    return newProcess;
  } catch(error) {
    const { cmd, killed } = error;
    log.error(`Error while executing ${cmd} - killed: ${killed}`);
    return undefined;
  }
};
/*:: type TaskExecutionCompletion = (output: string) => void; */
class TaskExecution {
  /*::
  +_task: TaskConfig;
  _process: ?child_process$ChildProcess;
  _completion: TaskExecutionCompletion;
  */

  constructor(task /*: TaskConfig */) {
    this._task = task;
    this._process = undefined;
    this._completion = () => {};
  }

  resume() {
    this._process = executeTask(this._task, (output) => {
      this.completion(output);
    });
  }

  terminate() {
    this.completion = () => {};
    log.info(`${this._task.program} will be killed…`);
    if(this._process != null) {
      this._process.kill('SIGKILL');
    }
  }

  set completion(cb /*: TaskExecutionCompletion */) {
    this._completion = cb;
  }

  get completion() /*: TaskExecutionCompletion */ {
    return this._completion;
  }
}

/*:: export type { TaskExecution }; */
module.exports = { TaskExecution };
