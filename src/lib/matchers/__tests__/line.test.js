// @flow
'use strict';

const matcher = require('./../line');

test('empty input', () => {
  const res = matcher('');
  expect(res.problems).toBeArrayOfSize(0);
  expect(res.summary).toBeUndefined();
  expect(res.summaryRenderer).toBeUndefined();
});

test('single line', () => {
  const res = matcher('hello world');
  const { problems } = res;
  expect(problems).toBeArrayOfSize(1);
  const problem = problems[0];
  expect(problem.category).toEqual('line');
  expect(problem.message).toEqual('hello world');
  expect(res.summary).toBeUndefined();
  expect(res.summaryRenderer).toBeUndefined();
});