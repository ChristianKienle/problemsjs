// @flow
'use strict';
const RunOperation = require('./run-operation');
const Run = require('./run');
const DefaultEmitterDelegate = require('./default-delegate');

/*::
import type Watcher from './../watcher';
type EmitterOptions = {
  matcherRegistry: MatcherRegistryInterface;
  tasks: TaskConfig[];
  watcher: Watcher;
  workspaceFolder: string;
};
*/

class Emitter /*:: implements EmitterInterface */ {
  /*::
  matcherRegistry: MatcherRegistryInterface;
  tasks: TaskConfig[];
  watcher: Watcher;
  workspaceFolder: string;
  delegate: EmitterDelegate;
  _operation: ?RunOperation;
  */
  constructor({ tasks, matcherRegistry, workspaceFolder, watcher } /*: EmitterOptions */) {
    this.tasks = tasks;
    this.matcherRegistry = matcherRegistry;
    this.watcher = watcher;
    this.workspaceFolder = workspaceFolder;
    this._operation = undefined;
    this.delegate = new DefaultEmitterDelegate();
  }

  resume() {
    // Initial problems
    this._onChangeDetected();

    // And watch
    this.watcher.resume((function() {
      this._onChangeDetected();
    }).bind(this));
  }

  _onChangeDetected() {
    this.delegate.willBeginRun();

    if(this._operation != null) {
      this._operation.cancel();
    }
    const operation = new RunOperation([...this.tasks], this.matcherRegistry);

    operation.onTaskWillBegin = (function(task) {
      this.delegate.willExecuteTask(task);
    }).bind(this);

    operation.onTaskDidFinish = (function() {
      this.delegate.didExecuteTask();
    }).bind(this);

    operation.completion = function() {
      const results = operation._results;
      const delegate = this.delegate;
      const run = new Run({ results, workspaceFolder: this.workspaceFolder });
      delegate.didEndRun(run);
    }.bind(this);
    this._operation = operation;
    operation.resume();
  }
}

module.exports = Emitter;
