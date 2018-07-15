// @flow
'use strict';

class OutlineModelEntry {
  /*::
  absolutePath: string;
  problems: Problem[];
  */
  constructor(absolutePath /*: string */, problems /*: Problem[] */) {
    this.absolutePath = absolutePath;
    this.problems = problems;
  }
}

class OutlineModel {
  /*:: entries: OutlineModelEntry[]; */
  constructor(problems /*: Problem[] */) {
    const problemsByFile = new Map/*::<string, Problem[]>*/();
    problems.forEach(problem => {
      const file = problem.location.source;
      const problemsForFile = problemsByFile.get(file) || [];
      problemsForFile.push(problem);
      problemsByFile.set(file, problemsForFile);
    });
    this.entries = [];
    problemsByFile.forEach((problemForFile, file) => {
      const entry = new OutlineModelEntry(file, problemForFile);
      this.entries.push(entry);
    });
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
