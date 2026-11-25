import { createEmptySmallBoard } from './createEmptySmallBoard';

/** The empty board of one size, laid out and labelled as that size. */
describe('createEmptySmallBoard function', () => {
  it('lays out 8 rows of 12 spaces and labels the board small', () => {
    const board = createEmptySmallBoard();
    expect(board.boardType).toBe('small');
    // Rows A to H, columns 1 to 12: H-12 is the far corner.
    expect(Object.keys(board.board)).toHaveLength(96);
    expect(board.board).toHaveProperty('H-12');
    // Does not have spaces that only medium and large boards have.
    expect(board.board).not.toHaveProperty('L-18');
    // Does not have spaces only present on a large board.
    expect(board.board).not.toHaveProperty('X-36');
  });
});
