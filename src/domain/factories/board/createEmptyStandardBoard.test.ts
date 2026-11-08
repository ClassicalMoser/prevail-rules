/**
 * Each empty board fills one layout with default spaces and satisfies boardSchema.
 */

import { boardSchema } from '@entities';
import { createEmptyStandardBoard } from './createEmptyStandardBoard';

describe('createEmptyStandardBoard function', () => {
  it('lays out 12 rows of 18 spaces and labels the board standard', () => {
    const board = createEmptyStandardBoard();
    expect(board.boardType).toBe('standard');
    // Rows A to L, columns 1 to 18: L-18 is the far corner.
    expect(Object.keys(board.board)).toHaveLength(216);
    expect(board.board).toHaveProperty('L-18');
  });

  it('satisfies boardSchema', () => {
    const board = createEmptyStandardBoard();
    expect(boardSchema.parse(board)).toStrictEqual(board);
  });
});
