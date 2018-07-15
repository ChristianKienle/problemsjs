// @flow
'use strict';

/*::
import type Watcher from './watcher';

type AppOptions = {
  executor: TaskExecutor;
  matcherRegistry: MatcherRegistryInterface;
  tasks: TaskConfig[];
  watcher: Watcher;
  workspaceFolder: string;
};
*/

const adjustedResult = (matcherName /*: string */, matcherResult /*: MatcherResult */) /*: MatcherResult */ => {
  const { problems } = matcherResult;
  problems.forEach(problem => {
    const { category } = problem;
    if(category.length === 0) {
      problem.category = matcherName;
    }
  });
  return matcherResult;
};

class App /*:: implements AppInterface */ {
  /*::
  executor: TaskExecutor;
  matcherRegistry: MatcherRegistryInterface;
  tasks: TaskConfig[];
  watcher: Watcher;
  workspaceFolder: string;
  delegate: ?ProblemsDelegate;
  */
  constructor({ tasks, executor, matcherRegistry, workspaceFolder, watcher } /*: AppOptions */) {
    this.tasks = tasks;
    this.executor = executor;
    this.matcherRegistry = matcherRegistry;
    this.watcher = watcher;
    this.workspaceFolder = workspaceFolder;
  }

  async resume(cb /*: (results: MatcherResult[]) => void */) {
    // Initial problems
    const results = await this._results();
    cb(results);
    this._resumeWatcher(cb);
  }

  _resumeWatcher(cb /*: (results: MatcherResult[]) => void */) {
    this.watcher.resume(() => {
      this._results().then(results => {
        cb(results);
      });
    });
  }

  async _results() /*: Promise<MatcherResult[]> */ {
    const delegate = this.delegate;
    if(delegate != null) {
      delegate.willBeginRun();
    }
    const results /*: MatcherResult[] */ = [];
    for(const task of this.tasks) {
      if(delegate != null) {
        delegate.willExecuteTask(task);
      }
      const result = await this.___matcherResultForTask(task);
      if(delegate != null) {
        delegate.didExecuteTask();
      }
      results.push(result);
    }
    if(delegate != null) {
      delegate.didEndRun(results);
    }
    return results;
  }

  // Throws if something is wrong
  async ___matcherResultForTask(task /*: TaskConfig */) /*: Promise<MatcherResult> */ {
    const matcherName = task.matcher;
    const matcher = this.matcherRegistry.matcher(matcherName);
    if(matcher == null || matcher === undefined) {
      throw Error(`unable to run task because matcher is unknown: ${matcherName}`);
    }
    const output = await this.executor.run(task);
    const result = adjustedResult(matcherName, matcher(output));
    return result;
  }
}

module.exports = App;
