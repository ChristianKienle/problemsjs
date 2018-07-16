// @flow
'use strict';
const { Rect, Point, Size } = require('./../geometry');

const StackView = require('./stack-view');

/*::
type RowRenderFunction$Options = {
  isSelected: boolean;
  frame: Rect;
  ui: TerminalUIInterface;
};

type RowRenderFunction = (options: RowRenderFunction$Options) => void;

type Section = {
  title: string;
  rows: Row[];
  onPrimaryAction: () => void;
};

type Row = {
  render: RowRenderFunction;
  onPrimaryAction: () => void;
};

export type { Section, Row };

*/




/*::
type TableView$RenderRequest = {
  isSelected:boolean;
  frame: UI$Rect;
  row: Row;
};

type TableView$RenderSectionHeaderRequest = {
  isSelected:boolean;
  frame: UI$Rect;
  title: string;
};

type TableViewOptions = {
  ui: TerminalUIInterface;
  frame: Rect;
};
*/

class TableView {
  /*::
  _stack: StackView;
  _sections: Section[];
  */

  constructor(options /*: TableViewOptions */) {
    this._stack = new StackView(options);
    this._sections = [];
  }

  get ui() { return this._stack.ui; }
  get frame() { return this._stack.frame; }

  addSection(section /*: Section */) {
    this._sections.push(section);
  }

  selectPrevious() {
    this._stack.selectPrevious();
  }

  selectNext() {
    this._stack.selectNext();
  }

  triggerPrimaryActionForSelection() {
    this._stack.triggerPrimaryActionForSelection();
  }

  render() {
    const ui = this.ui;
    ui.styleReset();
    ui.setWindowTitle('');
    ui.clear();

    const sections = this._sections;
    if(sections.length === 0) {
      this.renderEmptyState();
      return;
    }

    const SECTION_HEIGHT = 2;
    const ROW_HEIGHT = 1;
    const SECTION_SPACING = 1;
    const frame = this.frame;
    const stack = new StackView({ frame, ui });
    this._stack = stack;
    ui.eraseRect(frame);

    let currentLine = frame.origin.y;
    const stackX = frame.origin.x;


    sections.forEach(section => {
      // Add the section header
      const sectionOrigin = new Point({ x: stackX, y: currentLine });
      const sectionSize = new Size({ width: frame.width, height: SECTION_HEIGHT });
      const sectionFrame = new Rect({ size: sectionSize, origin: sectionOrigin });
      stack.add({
        render: (isSelected) => {
          this._renderSectionHeader({ isSelected, frame: sectionFrame, title: section.title});
        },
        onPrimaryAction: section.onPrimaryAction,
      });

      currentLine += SECTION_HEIGHT;

      // Add the rows
      const { rows } = section;
      rows.forEach(row => {
        const { render: renderRow } = row;
        const problemOrigin = new Point({ x: stackX, y: currentLine });
        const problemSize = new Size({ width: frame.width, height: ROW_HEIGHT });
        const problemFrame = new Rect({ size: problemSize, origin: problemOrigin });
        stack.add({
          render: (isSelected) => renderRow({ frame: problemFrame, ui, isSelected }),
          onPrimaryAction: row.onPrimaryAction,
        });
        currentLine += ROW_HEIGHT;
      });

      currentLine += SECTION_SPACING;
    });

    stack.render();
  }

  _renderSectionHeader({ isSelected, frame, title } /*: TableView$RenderSectionHeaderRequest */) {
    const t = this.ui;
    const { origin } = frame;
    t.styleReset();
    t.eraseRect(frame);
    t.moveTo(origin);
    t.text(' ');
    t.setBold(true);
    t.setInverse(isSelected);
    t.text(title);

    const hr = '┈'.repeat(t.width);
    t.setInverse(false);
    t.moveToNextLine();
    t.text('');
    t.setDimmed(true);
    t.text(hr);
    t.styleReset();
  }

  onKey(key /*: string */) {
    const term = this.ui;
    switch(key) {
    case 'ENTER': {
      const stack = this._stack;
      if(stack != null) {
        stack.triggerPrimaryActionForSelection();
      }
      break;
    }
    case 'UP': {
      const stack = this._stack;
      if(stack != null && stack !== undefined) {
        stack.selectPrevious();
      }
      break;
    }
    case 'DOWN': {
      const stack = this._stack;
      if(stack != null && stack !== undefined) {
        stack.selectNext();
      }
      break;
    }
    case 'CTRL_C': {
      term.clear();
      term.setCursorVisible(true);
      term.processExit(0);
      return; // do not remove - otherwise term.processExit does strange things.
    }
    default: break;
    }
  }

  renderEmptyState() {
    const t = this.ui;
    t.styleReset();
    const text = 'No Problems Found.';
    const y = t.height / 2;
    const x = 0.5 * (t.width - text.length);
    t.saveCursor();
    t.moveTo({x, y});
    t.defaultColor(text);
    t.restoreCursor();
  }
}

module.exports = TableView;
