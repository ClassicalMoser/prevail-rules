/**
 * A board size's grid: every space on it, row by row, and each space's row
 * and column both ways, worked out once from the size's layout.
 */

import { buildCoordinateGrid } from './buildCoordinateGrid';
import { smallCoordinateLayout } from './smallCoordinateLayout';

describe('buildCoordinateGrid function', () => {
  // The small board, 8 rows by 12 columns, is enough: every size's grid is
  // built the same way from its own layout.
  const grid = buildCoordinateGrid(smallCoordinateLayout);

  it('lists all 96 spaces of the small board, row by row from A-1', () => {
    // Row A first, column by column, then row B.
    expect(grid.coordinates).toHaveLength(96);
    expect(grid.coordinates.slice(0, 2)).toStrictEqual(['A-1', 'A-2']);
    expect(grid.coordinates[12]).toBe('B-1');
    expect(grid.coordinates[95]).toBe('H-12');
  });

  it('gives each space its row and column, counted from zero', () => {
    // E-5 is the fifth row and the fifth column.
    expect(grid.rowIndexByCoordinate.get('E-5')).toBe(4);
    expect(grid.columnIndexByCoordinate.get('E-5')).toBe(4);
  });

  it('holds no row or column for a space only a larger board has', () => {
    // Row I and column 13 lie off the small board.
    expect(grid.rowIndexByCoordinate.get('I-1')).toBeUndefined();
    expect(grid.columnIndexByCoordinate.get('A-13')).toBeUndefined();
  });

  it('finds the space at a row and column', () => {
    // Row 4, column 4 is E-5; the last row and column is H-12.
    expect(grid.coordinateRows[4]?.[4]).toBe('E-5');
    expect(grid.coordinateRows[7]?.[11]).toBe('H-12');
  });
});
