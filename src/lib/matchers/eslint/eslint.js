// @flow
'use strict';

const log = require('cmklog');
const { schema } = require('./schema');
const Ajv = require('ajv');
const ajv = new Ajv({ useDefaults: 'shared' });
const performValidation = ajv.compile(schema);

/*:: import type { RawESLintOutput } from './schema'; */

const problemsFromOutput = (rawOutput /*: RawESLintOutput */) /* Array<Problem> */ => {
  const problems /*: Problem[] */ = [];
  for(const raw of rawOutput) {
    const { messages, filePath: source } = raw;
    for(const msg of messages) {
      const { line, message } = msg;
      problems.push({
        message,
        category: 'lint',
        location: { line, source },
      });
    }
  }
  return problems;
};

const matcher /*: Matcher */ = (input /*: string */) => {
  try {
    const json = JSON.parse(input);
    if(performValidation(json) === false) {
      log.error(`Invalid eslint outout. Validation errors: ${ajv.errorsText()}`);
      return { problems: [] };
    }
    const eslintOutput = /*:: ( */ json /*: RawESLintOutput)*/;
    const problems = problemsFromOutput(eslintOutput);
    return { problems };
  } catch(error) {
    const message = `eslint matcher: JSON parse error: ${error.toString()}`;
    log.error(message);
    return { problems: [] };
  }
};

module.exports = matcher;
