// @flow
'use strict';

const matcher = require('./jest');
const { readFileSync } = require('fs');
const Path = require('path');

test('empty input', () => {
  const res = matcher('');
  expect(res.problems).toBeArrayOfSize(0);
  expect(res.summaryRenderer).toBeUndefined();
});

test('simple real failure', () => {
  const fixturePath = Path.join(__dirname, 'fixtures', 'failed-test.json');
  const jestOutput = readFileSync(fixturePath, 'utf8');
  const result = matcher(jestOutput);
  const { problems } = result;
  expect(problems).toBeArrayOfSize(1);
  const problem = problems[0];
  const { category, message, location } = problem;
  expect(category).toEqual('jest');
  expect(message).toEqual('\'fail please\' failed.');
  expect(location).toEqual({ source: '/Users/cmk/problemsjs/src/lib/matchers/jest/jest.test.js', line: 1 });
});
