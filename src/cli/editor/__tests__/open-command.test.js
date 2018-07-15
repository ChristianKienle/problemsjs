// @flow
'use strict';
// make eslint eat jests global test stuff
/* global test, expect */

const { openCommand } = require('./..');

test('open command', () => {
  const template = 'code ${absolutePath}:${line}';
  const line = 1337;
  const absolutePath = '/Users/cook/projects/applecar';
  const location = { line, absolutePath };
  const cmd = openCommand({template, location});
  expect(cmd).toEqual('code /Users/cook/projects/applecar:1337');
});
