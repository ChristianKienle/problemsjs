// @flow
'use strict';

const log = require('cmklog');

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
    this._matchersByName.set(name, matcher);
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
