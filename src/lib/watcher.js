// @flow
'use strict';
const chokidar = require('chokidar');
const log = require('cmklog');

class Watcher {
  /*::
  watchedFolder: string;
  includes: string[]; // globs
  ignores: string[]; // globs
  watcher: any;
  */
  constructor({ watchedFolder, includes, ignores } /*: WatcherOptions */) {
    this.watchedFolder = watchedFolder;
    this.includes = includes || ['**/*.js'];
    this.ignores = ignores;
  }

  resume(cb /*: () => void */) {
    const options = {
      ignored: this.ignores,
      cwd: this.watchedFolder,
      ignoreInitial: true,
    };
    this.watcher = chokidar.watch(this.includes, options);
    this.watcher.on('all', () => {
      log.info('File Watcher detected changes');
      cb();
    });
  }
}

module.exports = Watcher;
