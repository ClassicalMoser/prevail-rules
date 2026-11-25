import { positionByCoordinate } from './positionByCoordinate';

/**
 * Every space's row and column, counted from 0 at the north-west corner.
 * The board sizes nest (§2.1.3), so one table covers the largest board, and
 * each smaller board's spaces sit at the same row and column in it.
 */
describe('positionByCoordinate table', () => {
  it('holds every space of the largest board, 24 deep by 36 wide', () => {
    // 864 spaces, the large board's count; the smaller boards' are among them.
    expect(positionByCoordinate.size).toBe(864);
  });

  it('counts rows by letter from A and columns by number from 1', () => {
    // A-1 is the north-west corner, row 0 and column 0.
    expect(positionByCoordinate.get('A-1')).toStrictEqual({
      column: 0,
      row: 0,
    });
    // E-5 is the fifth row and the fifth column.
    expect(positionByCoordinate.get('E-5')).toStrictEqual({
      column: 4,
      row: 4,
    });
    // C-7 is the third row and the seventh column: rows and columns are not
    // swapped.
    expect(positionByCoordinate.get('C-7')).toStrictEqual({
      column: 6,
      row: 2,
    });
  });

  it('places the large board’s far corner at its last row and column', () => {
    // X-36, the south-east corner of the large board: row 23, column 35.
    expect(positionByCoordinate.get('X-36')).toStrictEqual({
      column: 35,
      row: 23,
    });
  });
});
