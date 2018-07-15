// @flow
'use strict';

const log = require('cmklog');

/*::
type ESLintMessageType = {
  message: string;
  line: number;
};
*/
const eslintMessageFromRawObject = (raw /*: Object */) /*: ?ESLintMessageType */ => {
  const { message, line } = raw;
  if(line == null || message == null) {
    return undefined;
  }
  if(typeof line !== 'number') {
    return undefined;
  }
  if(typeof message !== 'string') {
    return undefined;
  }
  return {
    line,
    message,
  };
};

// Input: A hopefully valid eslint output entry.
const problemsFromRawObject = (raw /*: Object */) /* Array<Problem> */ => {
  const { filePath, messages } = raw;
  if(filePath == null || messages == null) {
    return [];
  }
  if(typeof filePath !== 'string') {
    return [];
  }
  if(Array.isArray(messages) == false) {
    return [];
  }

  const eslintMessages /*: Array<ESLintMessageType> */ = [];
  for(const message of messages) {
    if(typeof message !== 'object') {
      continue;
    }
    const eslintMessage = eslintMessageFromRawObject(message);
    if(eslintMessage == null) {
      continue;
    }
    eslintMessages.push(eslintMessage);
  }

  const problems /*: Array<Problem> */ = eslintMessages.map(message => {
    const location /*: LocationType */ = {
      line: message.line,
      source: filePath,
    };
    return {
      location,
      category: 'lint',
      message: message.message,
    };
  });
  return problems;
};

const problemsFromJSON = (json /*: any */) /* Array<Problem> */ => {
  if(json == null) {
    return [];
  }
  if(Array.isArray(json) == false) {
    return [];
  }
  let problems /*: Problem[] */ = [];
  for(const raw of json) {
    if(typeof raw !== 'object') {
      continue;
    }
    const newProblems = problemsFromRawObject(raw);
    problems = [...problems, ...newProblems];
  }
  return problems;
};

const matcher /*: Matcher */ = (input /*: string */) => {
  try {
    const json = JSON.parse(input);
    const problems = problemsFromJSON(json);
    return { problems };
  } catch(error) {
    const message = `JSON parse error: ${error.toString()}`;
    log.error(message);
    return { problems: [] };
  }
};

module.exports = matcher;