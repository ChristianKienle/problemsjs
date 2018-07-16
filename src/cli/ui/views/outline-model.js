// @flow
'use strict';
const Path = require('path');

/*:: type EntryOptions = {
  absolutePath: string;
  relativePath: string;
  problems: Problem[];
}; */
class OutlineModelEntry {
  /*::
  absolutePath: string;
  problems: Problem[];
  relativePath: string;
  */
  constructor({ absolutePath, relativePath, problems } /*: EntryOptions */) {
    this.absolutePath = absolutePath;
    this.relativePath = relativePath;
    this.problems = problems;
  }
}

class OutlineModel {
  static fromRun({problems, workspaceFolder} /*: RunInterface */) {
    const entries /*: OutlineModelEntry[] */ = [];
    const problemsByFile = new Map/*::<string, Problem[]>*/();
    problems.forEach(problem => {
      const file = problem.location.source;
      const problemsForFile = problemsByFile.get(file) || [];
      problemsForFile.push(problem);
      problemsByFile.set(file, problemsForFile);
    });
    problemsByFile.forEach((problemsForFile, absolutePath) => {
      const relativePath = Path.relative(workspaceFolder, absolutePath);
      const entry = new OutlineModelEntry({ absolutePath, relativePath, problems: problemsForFile });
      entries.push(entry);
    });
    return new OutlineModel(entries);
  }

  /*:: entries: OutlineModelEntry[]; */
  constructor(entries /*: OutlineModelEntry[] */) {
    this.entries = entries;
  }

  get _problems() /*: Problem[] */ {
    const nestedProblems = this.entries.map(entry => entry.problems);
    return nestedProblems.reduce((all, entryProblems) => all.concat(entryProblems), []);
  }

  get problemsCount() {
    return this._problems.length;
  }
}

module.exports = {
  OutlineModel,
  OutlineModelEntry,
};
