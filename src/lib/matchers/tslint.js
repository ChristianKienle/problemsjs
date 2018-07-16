// @flow
'use strict';

const log = require('cmklog');

// Docs: https://palantir.github.io/tslint/formatters/json/

const problemFromRaw = (raw /*: mixed */) /*: ?Problem */ => {
  if(typeof raw !== 'object' || raw == null) {
    return undefined;
  }
  const {
    failure,
    name,
    startPosition,
  } = raw;

  if(typeof failure === 'string' && typeof name === 'string' && typeof startPosition === 'object' && startPosition != null) {
    const { line } = startPosition;
    if(typeof line !== 'number') {
      return undefined;
    }
    return {
      message: failure,
      category: 'tslint',
      location: {
        line,
        source: name,
      },
    };
  }
};

const matcher /*: Matcher */ = (input) => {
  try {
    const json = JSON.parse(input);
    if(json == null || json === undefined || Array.isArray(json) == false) {
      const message = 'jest-matcher failed during JSON parsing. Output is not a JSON object.';
      log.error(message);
      return { problems: [] };
    }
    const rawProblems = /*:: ( */json /*: mixed[] )*/;

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
    const message = `tslint-matcher failed during JSON parsing: ${error.toString()} - input: ${input.toString()}`;
    log.error(message);
    return { problems: [] };
  }
};

module.exports = matcher;