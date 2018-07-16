// @flow
'use strict';

const log = require('cmklog');

const _adjustedResult = (matcherName /*: string */, matcherResult /*: MatcherResult */) /*: MatcherResult */ => {
  const { problems } = matcherResult;
  problems.forEach(problem => {
    const { category } = problem;
    if(category.length === 0) {
      problem.category = matcherName;
    }
  });
  return matcherResult;
};

/*:: type AdjustingMatcher = (name: string, matcher: Matcher) => Matcher; */
const createAdjustingMatcher /*: AdjustingMatcher */= (matcherName /*: string */, originalMatcher /*: Matcher */) /*: Matcher */ => {
  return (input /* string */) => {
    return _adjustedResult(matcherName, originalMatcher(input));
  };
};

class MatcherRegistry /*:: implements MatcherRegistryInterface */ {
  /*::
  _matchersByName: Map<string, Matcher>;
  */
  constructor() {
    this._matchersByName = new Map/*::<string, Matcher>*/();
  }

  addMatcher(name /*: string */, matcher /*: Matcher */) {
    if(name.length === 0) {
      log.error('Matcher cannot have an empty name.');
      return;
    }
    const adjustingMatcher = createAdjustingMatcher(name, matcher);
    this._matchersByName.set(name, adjustingMatcher);
  }

  matcher(name /*: string */) /*: ?Matcher */ {
    return this._matchersByName.get(name);
  }

  get names() /*: string[] */ {
    return Array.from(this.matchersByName.keys());
  }

  get matchersByName() {
    return new Map/*:: <string, Matcher> */(this._matchersByName);
  }
}

module.exports = MatcherRegistry;
