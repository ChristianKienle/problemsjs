// @flow
'use strict';

const tslint = require('./../tslint');

test('empty string', () => {
  const { problems, summary, summaryRenderer } = tslint('');
  expect(problems).toBeArrayOfSize(0);
  expect(summary).toBeUndefined();
  expect(summaryRenderer).toBeUndefined();
});

test('empty json array', () => {
  const { problems, summary, summaryRenderer } = tslint('[]');
  expect(problems).toBeArrayOfSize(0);
  expect(summary).toBeUndefined();
  expect(summaryRenderer).toBeUndefined();
});

test('simple valid output', () => {
  const raw  = `
[
    {
        "endPosition": {
            "character": 13,
            "line": 2,
            "position": 13
        },
        "failure": "Missing semicolon",
        "fix": {
            "innerStart": 13,
            "innerLength": 0,
            "innerText": ";"
        },
        "name": "myFile.ts",
        "ruleName": "semicolon",
        "startPosition": {
            "character": 13,
            "line": 1,
            "position": 13
        }
    }
]
`;
  const { problems, summary, summaryRenderer } = tslint(raw);
  expect(problems).toBeArrayOfSize(1);
  expect(summary).toBeUndefined();
  expect(summaryRenderer).toBeUndefined();
  const problem = problems[0];
  expect(problem.message).toEqual('Missing semicolon');
  expect(problem.location.line).toEqual(1);
  expect(problem.location.source).toEqual('myFile.ts');
});
