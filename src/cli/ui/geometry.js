// @flow
'use strict';

class Point {
  /*:: x: number; y: number; */
  constructor({x, y} /*: UI$Point */ ) {
    this.x = x;
    this.y = y;
  }
}

class Size {
  /*:: width: number; height: number; */
  constructor({width, height} /*: UI$Size */ ) {
    this.width = width;
    this.height = height;
  }
}

/*:: type FlatRect = { x: number; y: number; width: number; height: number; }; */
class Rect {
  /*::
    origin: UI$Point;
    size: UI$Size;
  */
  constructor({origin, size} /*: $Shape<UI$Rect> */ ) {
    this.origin = new Point({...origin});
    this.size = new Size({...size});
  }

  static from(flatRect /*: FlatRect */) /*: Rect */ {
    const origin = new Point(flatRect);
    const size = new Size(flatRect);
    return new Rect({ origin, size});
  }

  get width() /*: number */ {
    return this.size.width;
  }
}

module.exports = {
  Rect,
  Point,
  Size,
};
