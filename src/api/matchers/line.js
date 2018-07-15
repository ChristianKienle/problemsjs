// @flow
'use strict';
const LINE_RX = /(\r\n?|\n|\u2028|\u2029)/;

// Returns the lines in `text`. Unlike `text.split(LINE_RX)`, this
// function does only return lines that are actually representing text.
// For example: '1\n2.split(LINE_RX) yields ['1', '\n', '2']'.
// Also note that:
// '1\n\n2.split(LINE_RX) yields ['1', '\n', '', '\n', '2']'.
// Thus `lines` also ensures that no empty lines are returned.
function linesFromString(text /*: string */) /*: Array<string> */ {
  const rawLines = text.split(LINE_RX);
  const lines /*: Array<string> */ = [];
  for(let idx = 0; idx < rawLines.length; idx++) {
    const isEven = (idx % 2) === 0;
    if(isEven == false) {
      continue;
    }
    const line = rawLines[idx];
    // ignore ''
    if(line === '') {
      continue;
    }
    lines.push(line);
  }
  return lines;
}

const matcher /*: Matcher */ = (input /*: string */) => {
  const lines = linesFromString(input);
  const problems /*: Array<Problem> */ = lines.map(line => {
    return {
      category: 'line',
      message: line,
      location: {
        source: '',
        line: 1,
      },
    };
  });
  return { problems };
};

module.exports = matcher;