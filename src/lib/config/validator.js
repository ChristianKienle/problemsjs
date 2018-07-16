// @flow
'use strict';

/*::
type ConfigValidatorOptions = {
  availableMatchers: string[];
};
*/
module.exports = (config /*: Config */, { availableMatchers } /*: ConfigValidatorOptions */) /*: boolean */ => {
  const { tasks } = config;
  for(const task of tasks) {
    const { matcher } = task;
    const matcherSupported = availableMatchers.includes(matcher);
    if(matcherSupported == false) {
      return false;
    }
  }
  return true;
};
