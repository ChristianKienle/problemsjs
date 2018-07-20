// @flow
'use strict';

const matcher = require('./eslint');

test('empty input', () => {
  const res = matcher('');
  expect(res.problems).toBeArrayOfSize(0);
  expect(res.summaryRenderer).toBeUndefined();
});

test('single problem', () => {
  const res = matcher(`
  [
    {
      "filePath": "/users/cmk/file.js",
      "messages": [
        {
          "message": "hello world",
          "line": 123
        }
      ]
    }
  ]
  `);
  const { problems } = res;
  expect(problems).toBeArrayOfSize(1);
  const problem = problems[0];
  expect(problem.category).toEqual('lint');
  expect(problem.message).toEqual('hello world');
  expect(problem.location).toBeObject();
  expect(problem.location).toEqual({ line: 123, source: '/users/cmk/file.js' });
  expect(res.summaryRenderer).toBeUndefined();
});

test('invalid json', () => {
  const res = matcher(`
  [
    {
      }
    }
  ]
  `);
  const { problems } = res;
  expect(problems).toBeArrayOfSize(0);
  expect(res.summaryRenderer).toBeUndefined();
});
