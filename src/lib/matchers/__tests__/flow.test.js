// @flow
'use strict';

const flow = require('./../flow');

test('empty string', () => {
  const { problems, summary, summaryRenderer } = flow('');
  expect(problems).toBeArrayOfSize(0);
  expect(summary).toBeUndefined();
  expect(summaryRenderer).toBeUndefined();
});

test('empty json object', () => {
  const { problems, summary, summaryRenderer } = flow('{}');
  expect(problems).toBeArrayOfSize(0);
  expect(summary).toBeUndefined();
  expect(summaryRenderer).toBeUndefined();
});

test('simple valid output', () => {
  const raw  = `
{
  "errors" : [{
    "message" : [{
      "descr": "hello",
      "loc": {
        "start": { "line": 123 },
        "source": "/Users/cmk/file.js"
      }
    }]
  }]
}
`;
  const { problems, summary, summaryRenderer } = flow(raw);
  expect(problems).toBeArrayOfSize(1);
  expect(summary).toBeUndefined();
  expect(summaryRenderer).toBeUndefined();
  const problem = problems[0];
  expect(problem.message).toEqual('hello');
  expect(problem.location.line).toEqual(123);
  expect(problem.location.source).toEqual('/Users/cmk/file.js');
});
