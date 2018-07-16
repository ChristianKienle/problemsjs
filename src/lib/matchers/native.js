// @flow
'use strict';

const log = require('cmklog');

const problemFromRaw = (raw /*: mixed */) /*: ?Problem */ => {
  if(typeof raw !== 'object' || raw == null) {
    return undefined;
  }

  const category = raw.category || '';

  const {
    location,
    message,
  } = raw;

  if(typeof category === 'string' && typeof message === 'string' && typeof location === 'object' && location != null) {
    const { line, source } = location;
    if(typeof line !== 'number') {
      return undefined;
    }
    if(typeof source !== 'string') {
      return undefined;
    }
    return {
      message,
      category,
      location: {
        line,
        source,
      },
    };
  }
};

const matcher /*: Matcher */ = (input) => {
  try {
    const json = JSON.parse(input);
    if(json == null || json === undefined || typeof json !== 'object') {
      const message = 'native matcher failed during JSON parsing. Output is not a JSON object.';
      log.error(message);
      return { problems: [] };
    }

    const rawProblems = json.problems;
    if(rawProblems == null || Array.isArray(rawProblems) == false) {
      return { problems: [] };
    }

    const problems /*: Problem[] */ = [];
    for(const rawProblem of rawProblems) {
      const problem = problemFromRaw(rawProblem);
      if(problem == null) {
        continue;
      }
      problems.push(problem);
    }
    return { problems };
  } catch(error) {
    const message = `native-matcher failed during JSON parsing: ${error.toString()} - input: ${input.toString()}`;
    log.error(message);
    return { problems: [] };
  }
};

module.exports = matcher;