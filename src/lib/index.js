// @flow
'use strict';

const Watcher = require('./watcher');
const Emitter = require('./emitter');
const Config = require('./config');
const Matchers = require('./matchers');

module.exports = { Matchers, Config, ...Emitter, Watcher };
