// @flow
'use strict';

const log = require('cmklog');

const matcher /*: Matcher */ = (input /*: string */) => {
  try {
    const json = JSON.parse(input);
    const { errors } = json;
    if(errors == null || Array.isArray(errors) == false) {
      return { problems: [] };
    }
    const problems /*: Array<Problem> */ = [];
    for(const error of errors) {
      if(typeof error === 'object') {
        const messages = error.message; // yes: singular
        if(messages != null && Array.isArray(messages)) {
          for(const message of messages) {
            const { descr, loc } = message;
            if(descr != null && typeof descr === 'string') {
              problems.push({
                category: 'flow',
                message: descr,
                location: {
                  source: loc.source,
                  line: loc.start.line,
                },
              });
            }
          }
        }
      }
    }
    return { problems };
  } catch(error) {
    const message = `flow-matcher failed during JSON parsing: ${error.toString()}`;
    log.error(message);
    return { problems: [] };
  }
};

module.exports = matcher;