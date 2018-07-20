// @flow
'use strict';

const matcher = require('./../line');

test('empty input', () => {
  const res = matcher('');
  expect(res.problems).toBeArrayOfSize(0);
  expect(res.summaryRenderer).toBeUndefined();
});

test('single line', () => {
  const res = matcher('hello world');
  const { problems } = res;
  expect(problems).toBeArrayOfSize(1);
  const problem = problems[0];
  expect(problem.category).toEqual('line');
  expect(problem.message).toEqual('hello world');
  expect(res.summaryRenderer).toBeUndefined();
});

test('multiple lines', () => {
  const res = matcher('hello world\nthis is cool');
  const { problems } = res;
  expect(problems).toBeArrayOfSize(2);
  expect(problems[0].category).toEqual('line');
  expect(problems[0].message).toEqual('hello world');
  expect(problems[1].category).toEqual('line');
  expect(problems[1].message).toEqual('this is cool');
  expect(res.summaryRenderer).toBeUndefined();
});

test('multiple lines', () => {
  const res = matcher('hello world\nthis is cool');
  const { problems } = res;
  expect(problems).toBeArrayOfSize(2);
  expect(problems[0].category).toEqual('line');
  expect(problems[0].message).toEqual('hello world');
  expect(problems[1].category).toEqual('line');
  expect(problems[1].message).toEqual('this is cool');
  expect(res.summaryRenderer).toBeUndefined();
});