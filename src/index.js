// @flow
'use strict';
/*:: import type { MatcherRegistry } from './api/matchers'; */

const CLI = require('./cli');

const { defaultMatcherRegistry } = require('./api/matchers');
const {
  defaultConfiguration,
  isValid: configurationIsValid,
} = require('./api/config/');
const App = require('./api/app');
const Watcher = require('./api/watcher');
const TaskExecutor = require('./api/task-executor');

class Problems {
  /*::
  delegate: ?ProblemsDelegate
  +_registry: MatcherRegistry;
  +_config: UnresolvedConfig;
  _app: ?AppInterface;
  */

  constructor(config = defaultConfiguration()) {
    this.delegate = undefined;
    this._config = config;
    this._registry = defaultMatcherRegistry;
    this._app = undefined;
  }

  useMatcher(name /*: string */, matcher /*: Matcher */) {
    this._registry.addMatcher(name, matcher);
  }

  get config() { return this._config; }

  start(cb /*: (results: MatcherResult[]) => void */) /*: Promise<void> */ {
    const config = this.config;
    const resolved = config.resolved();
    const registry = this._registry;

    // Validate config
    if(configurationIsValid(resolved, { availableMatchers: registry.names }) == false) {
      throw Error('Cannot start because config is invalid.');
    }

    const executor = new TaskExecutor();
    const watcher = new Watcher(resolved.watcherOptions);
    this._app = new App({
      executor,
      watcher,
      matcherRegistry: registry,
      tasks: resolved.tasks,
      workspaceFolder: resolved.workspaceFolder,
    });
    this._app.delegate = this.delegate;
    return this._app.resume(cb);
  }
}

module.exports = { CLI, App: Problems };
