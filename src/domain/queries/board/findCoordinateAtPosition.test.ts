import { createEmptySmallBoard } from '@factories';
import { findCoordinateAtPosition } from './findCoordinateAtPosition';

/**
 * The space at a row and column, or nothing past an edge of the board: a
 * step off the board is an ordinary answer, not a fault.
 */
describe('findCoordinateAtPosition function', () => {
  // The small board, rows A to H and columns 1 to 12, is enough: every size
  // reads its own list the same way.
  const board = createEmptySmallBoard();

  it('finds the space at a row and column, counted from zero', () => {
    // Row 4, column 4 is E-5; the first and last spaces are the corners.
    expect(findCoordinateAtPosition(board, { column: 4, row: 4 })).toBe('E-5');
    expect(findCoordinateAtPosition(board, { column: 0, row: 0 })).toBe('A-1');
    expect(findCoordinateAtPosition(board, { column: 11, row: 7 })).toBe(
      'H-12',
    );
  });

  it('finds nothing past the north or south edge', () => {
    // Row -1 is north of row A; row 8 is south of row H.
    expect(
      findCoordinateAtPosition(board, { column: 0, row: -1 }),
    ).toBeUndefined();
    expect(
      findCoordinateAtPosition(board, { column: 0, row: 8 }),
    ).toBeUndefined();
  });

  it("finds nothing past the east edge, rather than the next row's first space", () => {
    // One step east of A-12 is off the board. In the list it would be B-1,
    // which is not beside A-12 at all.
    expect(
      findCoordinateAtPosition(board, { column: 12, row: 0 }),
    ).toBeUndefined();
    // One step west of B-1 is off the board too, not A-12.
    expect(
      findCoordinateAtPosition(board, { column: -1, row: 1 }),
    ).toBeUndefined();
  });
});
