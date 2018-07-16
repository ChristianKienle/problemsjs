// @flow
'use strict';

const CLI = require('./cli');

const { Matchers, Emitter, DefaultEmitterDelegate, Watcher, Config } = require('./lib');
const {
  defaultConfiguration,
  isValid: configurationIsValid,
  resolved: resolvedConfiguration,
} = Config;

const { defaultMatchers } = Matchers;

class App {
  /*::
  delegate: EmitterDelegate
  +_registry: typeof defaultMatchers;
  +_config: UnresolvedConfig;
  _emitter: ?EmitterInterface;
  */

  constructor(config = defaultConfiguration()) {
    this.delegate = new DefaultEmitterDelegate();
    this._config = config;
    this._registry = defaultMatchers;
    this._emitter = undefined;
  }

  useMatcher(name /*: string */, matcher /*: Matcher */) {
    this._registry.addMatcher(name, matcher);
  }

  get config() { return this._config; }

  start() {
    const config = this.config;
    const resolved = resolvedConfiguration(config);
    const registry = this._registry;

    // Validate config
    if(configurationIsValid(resolved, { availableMatchers: registry.names }) == false) {
      throw Error('Cannot start because config is invalid.');
    }

    const watcher = new Watcher(resolved.watcherOptions);
    this._emitter = new Emitter({
      watcher,
      matcherRegistry: registry,
      tasks: resolved.tasks,
      workspaceFolder: resolved.workspaceFolder,
    });
    this._emitter.delegate = this.delegate;
    this._emitter.resume();
  }
}

module.exports = { CLI, App };
