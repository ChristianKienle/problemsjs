// @flow
'use strict';

/*::
type RunOptions = {
  +results: MatcherResult[];
  +workspaceFolder: string;
};
*/

class Run /*:: implements RunInterface */ {
  /*::
  +results: MatcherResult[];
  +workspaceFolder: string;
  */
  constructor({ results, workspaceFolder } /*: RunOptions */) {
    this.results = results;
    this.workspaceFolder = workspaceFolder;
  }

  get problems() /*: Problem[] */ {
    const { results } = this;
    if(results.length === 0) {
      return [];
    }
    const nested = results.map(res => res.problems);
    return nested.reduce((total, amount) => {
      return total.concat(amount);
    });
  }
}

module.exports = Run;
