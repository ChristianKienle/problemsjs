// @flow
'use strict';

// We simply write a few lines to stdout. The line-matcher should transform
// each line into a problem.
const { stdout } = process;
setTimeout(() => {
  stdout.write('HelloWorld\nNew Problem', 'utf8');
}, 1000);
