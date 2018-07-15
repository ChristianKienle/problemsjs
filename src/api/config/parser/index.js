// @flow
'use strict';

const { schema } = require('./schema');
const Ajv = require('ajv');
const ajv = new Ajv({ useDefaults: 'shared' });
const validateConfig = ajv.compile(schema);
const { readFileSync } = require('fs');
const resolveVariables = require('./../../lib/variable-resolver');
const Path = require('path');

// Throws if config at path is invalid
const fromFile = (path /*: string */) /*: UnresolvedConfig */ => {
  const data = readFileSync(path, 'utf8');
  return fromString(data);
};

const resolved = (config /*: UnresolvedConfig */) /*: Config */ => {
  const workspaceFolder = Path.resolve(config.workspaceFolder);
  const data = JSON.stringify(config);
  const resolvedData = resolveVariables({
    template: data,
    valueForVariableName: {
      workspaceFolder,
    },
  });
  const result = JSON.parse(resolvedData);
  const resolvedResult = {
    ...result,
    resolved: true,
  };
  return /*::(*/resolvedResult /*: Config) */;
};

const fromString = (data /*: string */) /*: UnresolvedConfig */ => {
  const json = JSON.parse(data);
  if(validateConfig(json)) {
    const config = /*::(*/json /*: UnresolvedConfig) */;
    return {
      ...config,
      resolved: () => {
        return resolved(config);
      },
    };
  }
  throw Error(`Invalid config ${data}. Validation errors: ${ajv.errorsText()}`);
};

module.exports = { fromString, fromFile };
