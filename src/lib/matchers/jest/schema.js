// @flow
'use strict';
/*::
type JestAssertionResult = {
  status: string; // passed | failed
  fullName: string; // name of the test
};

type JestTestResult = {
  assertionResults: JestAssertionResult[];
  status: string; // passed | failed
  name: string; // absolute path
};

type JestOutput = {
  testResults: JestTestResult[];
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
};

type JestSummaryType = {
  numPassedTests: number;
  numTotalTests: number;
  numFailedTests: number;
};

export type { JestOutput, JestSummaryType };
*/
const schema = {
  type: 'object',
  properties: {
    numPassedTests: { type: 'number' },
    numTotalTests: { type: 'number' },
    numFailedTests: { type: 'number' },
    testResults: {
      type: 'array',
      items: {
        properties: {
          name: { type: 'string' },
          status: { type: 'string' },
          assertionResults: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                fullName: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = { schema };
