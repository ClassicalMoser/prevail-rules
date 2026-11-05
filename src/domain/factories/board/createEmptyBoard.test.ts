/**
 * Each empty board fills one layout with default spaces and satisfies boardSchema.
 */

import { boardSchema } from '@entities';
import {
  createEmptyLargeBoard,
  createEmptySmallBoard,
  createEmptyStandardBoard,
} from './createEmptyBoard';

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

describe('createEmptyLargeBoard function', () => {
  it('lays out 24 rows of 36 spaces and labels the board large', () => {
    const board = createEmptyLargeBoard();
    expect(board.boardType).toBe('large');
    // Rows A to X, columns 1 to 36: X-36 is the far corner.
    expect(Object.keys(board.board)).toHaveLength(864);
    expect(board.board).toHaveProperty('X-36');
  });

  it('satisfies boardSchema', () => {
    const board = createEmptyLargeBoard();
    expect(boardSchema.parse(board)).toStrictEqual(board);
  });
});
