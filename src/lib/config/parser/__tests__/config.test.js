// @flow
'use strict';

// make eslint eat jests global test stuff
/* global test, expect */

const { fromString, resolved } = require('./..');

test('empty string throws', () => {
  expect(() => {
    fromString('');
  }).toThrowError();
});

test('empty object is valid config', () => {
  const config = fromString('{}');
  const {
    tasks,
    watcherOptions,
    workspaceFolder,
    openInEditorCommand,
  } = config;
  expect(tasks).toBeArrayOfSize(0);
  expect(workspaceFolder).toEqual('.');
  expect(openInEditorCommand).toBeUndefined();

  const { watchedFolder, includes } = watcherOptions;
  expect(includes).toEqual(['**/*.js']);
  expect(watchedFolder).toEqual('${workspaceFolder}');
});

test('empty array throws', () => {
  expect(() => {
    fromString('[]');
  }).toThrowError();
});

test('empty tasks but valid produces correct config', () => {
  const raw = '{"tasks": []}';
  const config = fromString(raw);
  const {
    tasks,
    watcherOptions,
    openInEditorCommand,
    workspaceFolder,
  } = config;

  expect(tasks).toBeArrayOfSize(0);
  expect(watcherOptions).toBeObject();
  expect(watcherOptions.watchedFolder).toEqual('${workspaceFolder}');
  expect(openInEditorCommand).toBeUndefined();
  expect(workspaceFolder).toEqual('.');
});

test('defaults: watcher options & workspaceFolder', () => {
  const raw = `
{
  "tasks": []
}
  `;
  const config = fromString(raw);
  const {
    tasks,
    watcherOptions,
    openInEditorCommand,
    workspaceFolder,
  } = config;

  expect(tasks).toBeArrayOfSize(0);
  expect(watcherOptions).toBeObject();
  expect(watcherOptions.watchedFolder).toEqual('${workspaceFolder}');
  expect(openInEditorCommand).toBeUndefined();
  expect(workspaceFolder).toEqual('.');
});

test('invalid task throws', () => {
  // notice the typo in 'program'
  expect(() => {
    fromString(`
    {
      "tasks": [
        {
          "programm": "ls",
          "matcher": "line"
        }
      ]
    }
    `);
  }).toThrowError();
});


test('simplest config with task', () => {
  const unresolved = fromString(`
    {
      "tasks": [
        {
          "program": "ls",
          "matcher": "line"
        }
      ]
    }
  `);

  expect(unresolved.tasks).toBeArrayOfSize(1);
  const unresolvedTask = unresolved.tasks[0];
  expect(unresolvedTask.program).toEqual('ls');
  expect(unresolvedTask.matcher).toEqual('line');
  expect(unresolvedTask.cwd).toEqual('${workspaceFolder}');
  expect(unresolvedTask.args).toEqual([]);

  // Resolve the config and test again
  const config = resolved(unresolved);
  expect(config.tasks).toBeArrayOfSize(1);
  const task = config.tasks[0];
  expect(task.program).toEqual('ls');
  expect(task.matcher).toEqual('line');
  expect(task.cwd).toEqual(process.cwd());
  expect(task.args).toEqual([]);
});
