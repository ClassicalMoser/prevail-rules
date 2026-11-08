/**
 * Each empty board fills one layout with default spaces and satisfies boardSchema.
 */

import { boardSchema } from '@entities';
import { createEmptySmallBoard } from './createEmptySmallBoard';

describe('createEmptySmallBoard function', () => {
  it('lays out 8 rows of 12 spaces and labels the board small', () => {
    const board = createEmptySmallBoard();
    expect(board.boardType).toBe('small');
    // Rows A to H, columns 1 to 12: H-12 is the far corner.
    expect(Object.keys(board.board)).toHaveLength(96);
    expect(board.board).toHaveProperty('H-12');
  });

  it('satisfies boardSchema', () => {
    const board = createEmptySmallBoard();
    expect(boardSchema.parse(board)).toStrictEqual(board);
  });
});
