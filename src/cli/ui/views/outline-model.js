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
  /*::
  +entries: OutlineModelEntry[];
  +generalProblems: OutlineModelEntry[]; // general problems without a location
  */
  constructor(entries /*: OutlineModelEntry[] */) {
    this.entries = entries;
    this.generalProblems = [];
  }

  static fromRun({problems, workspaceFolder} /*: RunInterface */) {
    const entries /*: OutlineModelEntry[] */ = [];
    const problemsByFile = new Map/*::<string, Problem[]>*/();
    const generalProblems /*: Problem[] */ = [];
    problems.forEach(problem => {
      const { source } = problem.location || {};
      if(source != null && source !== undefined) {
        const problemsForFile = problemsByFile.get(source) || [];
        problemsForFile.push(problem);
        problemsByFile.set(source, problemsForFile);
      } else {
        generalProblems.push(problem);
      }
    });

    problemsByFile.forEach((problemsForFile, absolutePath) => {
      const relativePath = Path.relative(workspaceFolder, absolutePath);
      const entry = new OutlineModelEntry({ absolutePath, relativePath, problems: problemsForFile });
      entries.push(entry);
    });
    return new OutlineModel(entries);
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
