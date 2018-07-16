// @flow
'use strict';

const { fromFile, fromString, resolved } = require('./parser');
const isValid = require('./validator');

const defaultConfiguration = () /*: UnresolvedConfig */ => {
  return fromString('{}');
};

module.exports = {
  isValid,
  defaultConfiguration,
  fromFile,
  resolved,
};
