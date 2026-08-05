import { boardSchema } from '@entities';
import {
  createEmptyLargeBoard,
  createEmptySmallBoard,
  createEmptyStandardBoard,
} from './createEmptyBoard';

/**
 * CreateEmptyStandardBoard: Creates an empty board space with default values.
 */
describe(createEmptyStandardBoard, () => {
  it('given defaults, creates an empty standard board', () => {
    const board = createEmptyStandardBoard();
    expect(board.boardType).toBe('standard');
    expect(Object.keys(board.board).length).toBeGreaterThan(0);
  });

  it('parses through boardSchema', () => {
    const board = createEmptyStandardBoard();
    expect(boardSchema.parse(board)).toEqual(board);
  });

  it('round-trips through JSON with exact key set', () => {
    const board = createEmptyStandardBoard();
    const parsed = boardSchema.parse(JSON.parse(JSON.stringify(board)));
    expect(parsed).toEqual(board);
    expect(new Set(Object.keys(parsed.board))).toEqual(
      new Set(Object.keys(board.board)),
    );
  });
});

describe(createEmptySmallBoard, () => {
  it('given defaults, creates an empty small board', () => {
    const board = createEmptySmallBoard();
    expect(board.boardType).toBe('small');
    expect(Object.keys(board.board).length).toBeGreaterThan(0);
  });

  it('parses through boardSchema', () => {
    const board = createEmptySmallBoard();
    expect(boardSchema.parse(board)).toEqual(board);
  });

  it('round-trips through JSON with exact key set', () => {
    const board = createEmptySmallBoard();
    const parsed = boardSchema.parse(JSON.parse(JSON.stringify(board)));
    expect(parsed).toEqual(board);
    expect(new Set(Object.keys(parsed.board))).toEqual(
      new Set(Object.keys(board.board)),
    );
  });
});

describe(createEmptyLargeBoard, () => {
  it('given defaults, creates an empty large board', () => {
    const board = createEmptyLargeBoard();
    expect(board.boardType).toBe('large');
    expect(Object.keys(board.board).length).toBeGreaterThan(0);
  });

  it('parses through boardSchema', () => {
    const board = createEmptyLargeBoard();
    expect(boardSchema.parse(board)).toEqual(board);
  });

  it('round-trips through JSON with exact key set', () => {
    const board = createEmptyLargeBoard();
    const parsed = boardSchema.parse(JSON.parse(JSON.stringify(board)));
    expect(parsed).toEqual(board);
    expect(new Set(Object.keys(parsed.board))).toEqual(
      new Set(Object.keys(board.board)),
    );
  });
});
