// @flow
'use strict';
const chokidar = require('chokidar');

class Watcher {
  /*::
  watchedFolder: string;
  includes: string[]; // globs
  watcher: any;
  */
  constructor({ watchedFolder, includes } /*: WatcherOptions */) {
    this.watchedFolder = watchedFolder;
    this.includes = includes || ['**/*.js'];
  }

  resume(cb /*: () => void */) {
    this.watcher = chokidar.watch(this.includes, { cwd: this.watchedFolder, ignoreInitial: true });
    this.watcher.on('all', () => {
      cb();
    });
  }
}

module.exports = Watcher;