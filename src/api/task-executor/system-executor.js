// @flow
'use strict';

const log = require('cmklog');
const execa = require('execa');

class SystemExecutor /*:: implements TaskExecutor */ {
  /*::
  _programName: ?string;
  _process: ?child_process$ChildProcess;
  */

  // TaskExecutor Implementation

  // Tools like jest terminate with a non-0 exit code when they encounter a problem (eg. a failing test).
  // execa throws in this case. That is why we catch the error and extract the std-output as if nothing had
  // happened.
  async run(task /*: TaskConfig */) /*: Promise<string> */ {
    const { program, args } = task;
    log.info(`Will execute: ${program}`);
    if(this._process != null) {
      const currentProcess = this._process;
      log.info(`run called while still running ${this._programName || ''}. Will be killed…`);
      currentProcess.kill('SIGKILL');
      this._process = undefined;
      this._programName = undefined;
    }
    try {
      const tenMB = 10000000;
      const cwd = task.cwd || process.cwd();
      const maxBuffer = tenMB * 10; // => 100 MB
      this._programName = program;
      const newProcess = execa(program, args, { cwd, maxBuffer });
      this._process = newProcess;
      log.info(`Done executing ${program}.`);
      const { stdout } = await newProcess;
      this._process = undefined;
      this._programName = undefined;
      return stdout;
    } catch(error) {
      const { stdout, cmd, killed } = error;
      log.error(`Error while executing ${cmd} - killed: ${killed}`);
      this._process = undefined;
      this._programName = undefined;
      return stdout;
    }
  }
}

module.exports = SystemExecutor;
