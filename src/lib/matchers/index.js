// @flow
'use strict';

const eslint = require('./eslint');
const tslint = require('./tslint');
const flow = require('./flow');
const jest = require('./jest');
const line = require('./line');
const native = require('./native');
const MatcherRegistry = require('./matcher-registry');
const defaultMatchers = new MatcherRegistry();

defaultMatchers.addMatcher('eslint', eslint);
defaultMatchers.addMatcher('tslint', tslint);
defaultMatchers.addMatcher('jest', jest);
defaultMatchers.addMatcher('flow', flow);
defaultMatchers.addMatcher('line', line);
defaultMatchers.addMatcher('native', native);

module.exports = {
  eslint,
  tslint,
  flow,
  jest,
  line,
  native,
  MatcherRegistry,
  defaultMatchers,
};
