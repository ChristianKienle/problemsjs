// @flow
'use strict';
const { exec } = require('child_process');

/*::
type Location =  {
    line: number;
    absolutePath: string;
};
type OpenOptions = {
  template: string;
  location: Location | string;
};

type CreateOpenCommandOptions = {
  template: string;
  location: Location;
};
*/
const openCommand = ({ template, location } /*: CreateOpenCommandOptions */) /*: string */ => {
  const { line, absolutePath } = location;
  // Replace ${absolutePath} and ${line}
  return template.replace(/\${line}/g, String(line)).replace(/\${absolutePath}/g, absolutePath);
};

const _locationFrom = (weakLocation /*: Location | string */) => {
  if(typeof weakLocation === 'string') {
    return {
      absolutePath: weakLocation,
      line: 1,
    };
  }
  return weakLocation;
};

const openInEditor = ({ template, location } /*: OpenOptions */) /*: void */ => {
  const _location = _locationFrom(location);
  const cmd = openCommand({template, location: _location});
  exec(cmd);
};

module.exports = {
  openCommand,
  openInEditor,
};
