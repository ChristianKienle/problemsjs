// @flow
'use strict';
/*::
type RawESLintProblem = {
  filePath: string;
  messages: { message: string; line: number; }[];
};
type RawESLintOutput = RawESLintProblem[];
export type { RawESLintOutput };
*/
const schema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      filePath: { type: 'string' },
      messages: {
        type: 'array',
        items: {
          properties: {
            message: { type: 'string' },
            line: { type: 'number' },
          },
        },
      },
    },
  },
};

module.exports = { schema };
