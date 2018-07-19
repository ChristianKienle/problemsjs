// @flow
'use strict';

const schema = {
  type: 'object',
  required: [],
  properties: {
    workspaceFolder: {
      type: 'string',
      default: '.',
    },
    openInEditorCommand: { type: 'string' },
    watcherOptions: {
      type: 'object',
      default: {
        watchedFolder: '${workspaceFolder}',
        includes: ['**/*.js'],
      },
      properties: {
        includes: { items: [{ type: 'string' }] },
        ignores: { items: [{ type: 'string' }] },
        watchedFolder: { type: 'string' },
      },
    },
    tasks: {
      default: [],
      items: {
        type: 'object',
        properties: {
          program: {
            type: 'string',
            minLength: 1,
          },
          name: {
            type: 'string',
          },
          args: {
            type: 'array',
            default: [],
          },
          cwd: {
            type: 'string',
            minLength: 1,
            default: '${workspaceFolder}',
          },
          matcher: {
            type: 'string',
            minLength: 1,
          },
        },
        required: [
          'program',
          'matcher',
        ],
      },
    },
  },
};

module.exports = { schema };
