import { createEmptyLargeBoard } from './createEmptyLargeBoard';

/** The empty board of one size, laid out and labelled as that size. */
describe('createEmptyLargeBoard function', () => {
  it('lays out 24 rows of 36 spaces and labels the board large', () => {
    const board = createEmptyLargeBoard();
    expect(board.boardType).toBe('large');
    // Rows A to X, columns 1 to 36: X-36 is the far corner.
    expect(Object.keys(board.board)).toHaveLength(864);
    expect(board.board).toHaveProperty('X-36');
  });
});
