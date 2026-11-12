import type { Coordinate } from '@entities';
import { createEmptyStandardBoard } from '@factories';
import { getGridPosition } from './getGridPosition';

const board = createEmptyStandardBoard();

/**
 * GetGridPosition: where a space sits on its board, as row and column
 * positions counted from 0.
 */
describe('getGridPosition function', () => {
  it('places the first space at row 0, column 0', () => {
    // A-1 is the board's first row and first column.
    expect(getGridPosition(board, 'A-1')).toStrictEqual({ column: 0, row: 0 });
  });

  it('counts rows by letter and columns by number', () => {
    // E is the fifth row and 5 the fifth column, so both sit at position 4.
    expect(getGridPosition(board, 'E-5')).toStrictEqual({ column: 4, row: 4 });
    // C-7: the third row, the seventh column.
    expect(getGridPosition(board, 'C-7')).toStrictEqual({ column: 6, row: 2 });
  });

  it('throws for a coordinate that is not on the board', () => {
    // No board has a row Z; the type would refuse it, so it is forced past
    // to stand for bad input from outside.
    expect(() =>
      getGridPosition(board, 'Z-5' as unknown as Coordinate),
    ).toThrow('Invalid coordinate: Z-5');
  });
});
