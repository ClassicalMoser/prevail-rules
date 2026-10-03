/**
 * Each empty board fills one layout with default spaces and satisfies boardSchema.
 */

import { boardSchema } from '@entities';
import {
  createEmptyLargeBoard,
  createEmptySmallBoard,
  createEmptyStandardBoard,
} from './createEmptyBoard';

describe(createEmptyStandardBoard, () => {
  it('fills the standard layout and labels the board standard', () => {
    const board = createEmptyStandardBoard();
    expect(board.boardType).toBe('standard');
    expect(Object.keys(board.board).length).toBeGreaterThan(0);
  });

  it('satisfies boardSchema', () => {
    const board = createEmptyStandardBoard();
    expect(boardSchema.parse(board)).toStrictEqual(board);
  });
});

describe(createEmptySmallBoard, () => {
  it('fills the small layout and labels the board small', () => {
    const board = createEmptySmallBoard();
    expect(board.boardType).toBe('small');
    expect(Object.keys(board.board).length).toBeGreaterThan(0);
  });

  it('satisfies boardSchema', () => {
    const board = createEmptySmallBoard();
    expect(boardSchema.parse(board)).toStrictEqual(board);
  });
});

describe(createEmptyLargeBoard, () => {
  it('fills the large layout and labels the board large', () => {
    const board = createEmptyLargeBoard();
    expect(board.boardType).toBe('large');
    expect(Object.keys(board.board).length).toBeGreaterThan(0);
  });

  it('satisfies boardSchema', () => {
    const board = createEmptyLargeBoard();
    expect(boardSchema.parse(board)).toStrictEqual(board);
  });
});
