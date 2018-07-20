// @flow
'use strict';

const tslint = require('./../tslint');

test('empty string', () => {
  const { problems, summaryRenderer } = tslint('');
  expect(problems).toBeArrayOfSize(0);
  expect(summaryRenderer).toBeUndefined();
});

test('empty json array', () => {
  const { problems, summaryRenderer } = tslint('[]');
  expect(problems).toBeArrayOfSize(0);
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
  const { problems, summaryRenderer } = tslint(raw);
  expect(problems).toBeArrayOfSize(1);
  expect(summaryRenderer).toBeUndefined();
  const problem = problems[0];
  expect(problem.message).toEqual('Missing semicolon');
  const { location = {} } = problem;
  expect(location.line).toEqual(1);
  expect(location.source).toEqual('myFile.ts');
});
