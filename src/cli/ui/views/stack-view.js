// @flow
'use strict';

/*::
import type { Rect, Point, Size } from './../geometry';
type StackView$PrimaryAction = () => void;
type StackView$Row = {
  +render: RenderFunction;
  +onPrimaryAction: StackView$PrimaryAction;
};


*/

/*::
type StackView$Options = { frame: Rect; ui: TerminalUIInterface; };
*/
class StackView {
  constructor({ frame, ui } /*: StackView$Options */) {
    this._frame = frame;
    this._ui = ui;
    this._selectedRow = undefined;
    this._rows = [];
  }
  /*::
  +_ui: TerminalUIInterface;
  +_rows: StackView$Row[];
  _selectedRow: ?number;
  +_frame: Rect;
  */

  get frame() { return this._frame; }
  get ui() { return this._ui; }

  add(row /*: StackView$Row */) {
    this._rows.push(row);
  }

  render() {
    this._ui.eraseRect(this._frame);
    this._rows.forEach((row) => {
      row.render(false);
    });
  }

  _redrawRowsAtIndexes(rowIndexes /*: number[] */) {
    const selectedRowIndex = this._selectedRow;
    rowIndexes.forEach(index => {
      const row = this._rows[index];
      const isSelected = index === selectedRowIndex;
      row.render(isSelected);
    });
  }

  __handleNoSelection() {
    if(this._rows.length === 0) {
      this._selectedRow = undefined;
      return;
    }
    this._selectedRow = 0;
    this._redrawRowsAtIndexes([0]);
  }

  selectPrevious() {
    const selection = this._selectedRow;
    if(selection == null || selection === undefined) {
      this.__handleNoSelection();
      return;
    }
    const newRow = Math.max(0, selection - 1);
    this._selectedRow = newRow;
    this._redrawRowsAtIndexes([selection, newRow]);
  }

  selectNext() {
    const selection = this._selectedRow;
    if(selection == null || selection === undefined) {
      this.__handleNoSelection();
      return;
    }
    const maxLine = this._rows.length - 1;
    const newRow = Math.max(0, Math.min(selection + 1, maxLine));
    this._selectedRow = newRow;
    this._redrawRowsAtIndexes([selection, newRow]);
  }

  triggerPrimaryActionForSelection() {
    const selection = this._selectedRow;
    if(selection != null) {
      const row = this._rows[selection];
      row.onPrimaryAction();
    }
  }
}

module.exports = StackView;
