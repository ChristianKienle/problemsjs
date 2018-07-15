// @flow
'use strict';

const eslint = require('./eslint');
const tslint = require('./tslint');
const flow = require('./flow');
const jest = require('./jest');
const line = require('./line');
const native = require('./native');
const MatcherRegistry = require('./matcher-registry');
const defaultMatcherRegistry = new MatcherRegistry();

defaultMatcherRegistry.addMatcher('eslint', eslint);
defaultMatcherRegistry.addMatcher('tslint', tslint);
defaultMatcherRegistry.addMatcher('jest', jest);
defaultMatcherRegistry.addMatcher('flow', flow);
defaultMatcherRegistry.addMatcher('line', line);
defaultMatcherRegistry.addMatcher('native', native);

module.exports = {
  eslint,
  tslint,
  flow,
  jest,
  line,
  native,
  MatcherRegistry,
  defaultMatcherRegistry,
};
