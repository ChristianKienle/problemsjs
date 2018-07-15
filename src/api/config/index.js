// @flow
'use strict';

const { fromFile, fromString } = require('./parser');
const isValid = require('./validator');

const defaultConfiguration = () /*: UnresolvedConfig */ => {
  return fromString('{}');
};

module.exports = {
  isValid,
  defaultConfiguration,
  fromFile,
};
