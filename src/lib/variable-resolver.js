// @flow
'use strict';

/*::
type ResolveOptions = {
  template: string;
  valueForVariableName: { [variable_name: string]: string };
};
*/

// Thanks vscode
const VARIABLE_REGEXP = /\$\{(.*?)\}/g;

const resolve = ( { template, valueForVariableName } /*: ResolveOptions */) /*: string */ => {
  const compiled = template.replace(VARIABLE_REGEXP, (match, variableName) => {
    const value = valueForVariableName[variableName];
    if(value == null || value === undefined) {
      // do not replace anything
      // we cannot fail because recursive resolving is not yet supported but required (openInEditorCommand).
      return match;
    }
    return value;
  });
  return compiled;
};

module.exports = resolve;
