// @flow
'use strict';
const log = require('cmklog');

const { TaskExecution } = require('./task-execution');

/*::
type RunOperationCompletion = () => void;
type TaskAction = (task: TaskConfig) => void;
*/

class RunOperation {
  /*::
  +_matcherRegistry: MatcherRegistryInterface;
  _waiting: TaskConfig[];
  _executingTask: ?TaskConfig;
  _completed: TaskConfig[];
  _results: MatcherResult[];
  _completion: RunOperationCompletion;
  _execution: ?TaskExecution;
  onTaskWillBegin: TaskAction;
  onTaskDidFinish: TaskAction;
  */

  constructor(tasks /*: TaskConfig[] */, matcherRegistry /*: MatcherRegistryInterface */) {
    this._matcherRegistry = matcherRegistry;
    this._waiting = tasks;
    this._executingTask = undefined;
    this._execution = undefined;
    this._completed = [];
    this._completion = () => {};
    this._results = [];
    this.onTaskWillBegin = () => {};
    this.onTaskDidFinish = () => {};
  }

  resume() {
    this._executeNextOrFinish();
  }

  cancel() {
    this._completion = () => {};
    if(this._execution != null) {
      this._execution.terminate();
    }
  }

  set completion(block /*: RunOperationCompletion */) {
    this._completion = block;
  }

  get completion() { return this._completion; }

  _finish() {
    this._completion();
  }

  _executeNextOrFinish() {
    if(this._waiting.length === 0) {
      this._finish();
      return;
    }
    const task = this._nextTask;
    if(task != null && task != undefined) {
      const matcherName = task.matcher;
      const matcher = this._matcherRegistry.matcher(matcherName);
      this._waiting.shift();
      const execution = new TaskExecution(task);
      this._executingTask = task;
      this._execution = execution;
      execution.completion = function(output) {
        log.info(`done ${task.program}.`);
        this.onTaskDidFinish(task);
        if(matcher != null) {
          const res = matcher(output);
          this._results.push(res);
        }
        this._completed.push(task);
        this._executingTask = undefined;
        this._execution = undefined;
        this._executeNextOrFinish();
      }.bind(this);
      this.onTaskWillBegin(task);
      log.info(`Will begin task: ${task.program}.`);
      execution.resume();
      return;
    }
  }

  get _nextTask() /*: ?TaskConfig */ {
    if(this._waiting.length === 0) {
      return undefined;
    }
    return this._waiting[0];
  }
}

module.exports = RunOperation;
