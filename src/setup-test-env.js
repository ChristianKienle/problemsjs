//@flow
'use strict';
const log = require('cmklog');
const Path = require('path');

const logPath = Path.join(process.cwd(), '.tests.log');
log.setDestination(logPath);
