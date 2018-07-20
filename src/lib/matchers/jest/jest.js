// @flow
'use strict';
const log = require('cmklog');
const { schema } = require('./schema');
const Ajv = require('ajv');
const ajv = new Ajv({ useDefaults: 'shared' });
const performValidation = ajv.compile(schema);

/*:: import type { JestOutput, JestSummaryType } from './schema'; */

const _renderSummaryOfOutput = (output /*: JestSummaryType | typeof undefined */, term /*: TerminalUIInterface */) => {
  if(output == null) {
    return;
  }
  const { numPassedTests, numTotalTests, numFailedTests } = output;
  term.styleReset();
  term.setBackgroundBrightWhite(true);
  term.setForegroundColorGray(true);
  term.text(' Tests ');

  term.styleReset();
  term.setForegroundColorGray(true);
  term.setInverse(true);
  term.text(` ${numTotalTests} total `);

  term.styleReset();
  term.setForegroundColorGreen(true);
  term.setInverse(true);
  term.text(` ${numPassedTests} passed `);

  if(numFailedTests > 0) {
    term.styleReset();
    term.setForegroundColorRed(true);
    term.setInverse(true);
    term.text(` ${numFailedTests} failed `);
  }
};

const _problemsFromOutput = (raw /*: JestOutput */) /*: Problem[] */ => {
  const { testResults } = raw;
  const problems /*: Problem[] */ = [];
  const failedTestResults = testResults.filter(result => result.status === 'failed');
  for(const result of failedTestResults) {
    const { assertionResults } = result;
    for(const assertion of assertionResults) {
      const { status, fullName } = assertion;
      if(status !== 'failed') {
        continue;
      }
      problems.push({
        category: 'jest',
        message: `'${fullName}' failed.`,
        location: {
          line: 1,
          source: result.name,
        },
      });
    }
  }
  return problems;
};

const matcher /*: Matcher */ = (input /*: string */) => {
  try {
    const json = JSON.parse(input);
    if(performValidation(json) === false) {
      log.error(`Invalid jest outout. Validation errors: ${ajv.errorsText()}`);
      return { problems: [] };
    }
    const output = /*:: ( */ json /*: JestOutput)*/;
    const problems = _problemsFromOutput(output);
    const summaryRenderer /*: SummaryRenderer */ = (term) => {
      _renderSummaryOfOutput(output, term);
    };
    return { problems, summaryRenderer };
  } catch(error) {
    const message = `jest-matcher failed during JSON parsing: ${error.toString()} - input: ${input.toString()}`;
    log.error(message);
    return { problems: [] };
  }
};

module.exports = matcher;