// @flow
'use strict';

const log = require('cmklog');

/*::
type AssertionResult = {
  fullName: string;
  status: string;
};

type TestResult = {
  status: string;
  name: string;
  message: string;
  assertionResults: AssertionResult[];
};
*/

function assertionResultFromRaw(raw /*: ?mixed */) /*: ?AssertionResult */ {
  if(raw == null || raw === undefined) {
    return undefined;
  }
  if(typeof raw !== 'object'){ return undefined; }
  const { fullName, status } = raw;
  if(fullName == null || status == null) {
    return undefined;
  }
  if(typeof fullName === 'string' && typeof status === 'string') {
    return { fullName, status };
  }
  return undefined;
}

function assertionResultsFromRaw(raw /*: ?mixed */) /*: AssertionResult[] */ {
  if(raw == null || raw === undefined) {
    return [];
  }
  if(!Array.isArray(raw)){ return []; }
  const assertions /*: AssertionResult[] */ = [];
  for(const rawAssert of raw) {
    const assertion = assertionResultFromRaw(rawAssert);
    if(assertion == null) {
      continue;
    }
    assertions.push(assertion);
  }
  return assertions;
}

function testResultFromRaw(raw /*: any */) /*: ?TestResult */ {
  if(!raw) { return; }
  if(typeof raw === 'object') {
    const { message, name, status } = raw;
    if(name && status && message) {
      if(typeof message === 'string' && typeof name === 'string' && typeof status === 'string') {
        const assertionResults = assertionResultsFromRaw(raw.assertionResults);
        return { name, status, message, assertionResults };
      }
    }
  }
  return undefined;
}

function _testResults(raw /*: any */) /*: TestResult[] | typeof undefined */ {
  if(raw != null && raw !== undefined && Array.isArray(raw)) {
    const results /*: TestResult[] */ = [];
    for(const rawResult of raw) {
      const result = testResultFromRaw(rawResult);
      if(result) {
        results.push(result);
      }
    }
    return results;
  }
  return undefined;
}

function _problemsFrom(results /*: TestResult[] */) /*: Problem[] */ {
  const problems /*: Problem[] */ = [];

  for(const result of results) {
    const { status, name, assertionResults } = result;
    if(status !== 'failed') {
      continue;
    }
    // Find failed assertionResults
    const failedAsserts = assertionResults.filter(assertion => assertion.status === 'failed');
    if(failedAsserts.length === 0) {
      continue;
    }
    const problemsForFailures /*: Problem[] */ = failedAsserts.map((assertion) => {
      return {
        category: 'jest',
        message: `'${assertion.fullName}' failed.`,
        location: {
          line: 1,
          source: name,
        },
      };
    });
    problems.push(...problemsForFailures);
  }
  return problems;
}

/*:: type JestSummaryType = {
  numPassedTests: number;
  numTotalTests: number;
  numFailedTests: number;
};
*/

const _summary = (json /*: Object */) /*: JestSummaryType | typeof undefined */ => {
  const {
    numTotalTests,
    numPassedTests,
    numFailedTests,
  } = json;
  if(numPassedTests == null || numPassedTests === undefined || typeof numPassedTests !== 'number') {
    return undefined;
  }
  if(numTotalTests == null || numTotalTests === undefined || typeof numTotalTests !== 'number') {
    return undefined;
  }
  if(numFailedTests == null || numFailedTests === undefined || typeof numFailedTests !== 'number') {
    return undefined;
  }
  return { numPassedTests, numTotalTests, numFailedTests };
};

const _summaryText = (json /*: Object */) /*: string | typeof undefined */ => {
  const { numTotalTests, numPassedTests } = json;
  if(numPassedTests == null || numPassedTests === undefined || typeof numPassedTests !== 'number') {
    return undefined;
  }
  if(numTotalTests == null || numTotalTests === undefined || typeof numTotalTests !== 'number') {
    return undefined;
  }
  return `Tests: ${numPassedTests} passed, ${numTotalTests} total`;
};

const _renderSummary = (summary /*: JestSummaryType | typeof undefined */, term /*: TerminalUIInterface */) => {
  if(summary == null) {
    return;
  }
  const { numPassedTests, numTotalTests, numFailedTests } = summary;
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

const matcher /*: Matcher */ = (input /*: string */) => {
  try {
    const json = JSON.parse(input);
    if(typeof json !== 'object') {
      const message = 'jest-matcher failed during JSON parsing. Output is not a JSON object.';
      log.info(message);
      return { problems: [] };
    }
    const testResults = _testResults(json.testResults) || [];
    const problems = _problemsFrom(testResults);
    const summary = _summaryText(json);
    const summaryObject = _summary(json);
    const summaryRenderer /*: SummaryRenderer */ = (term) => {
      _renderSummary(summaryObject, term);
    };

    return {
      problems,
      summaryRenderer: summaryRenderer,
      summary: summary,
    };
  } catch(error) {
    const message = `jest-matcher failed during JSON parsing: ${error.toString()} - input: ${input.toString()}`;
    log.error(message);
    return { problems: [] };
  }
};

module.exports = matcher;