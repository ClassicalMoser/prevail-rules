import type { Board } from '@entities';
import { createEmptyLargeBoard, createEmptySmallBoard } from '@factories';
import { z } from 'zod';

import { refineBoardLayout } from './refineBoardLayout';

/**
 * Accepts any shape, so each case reaches the layout check without the board
 * shape checks getting there first.
 */
const boardLayout = z.custom<Board>().superRefine(refineBoardLayout);

describe('refineBoardLayout function', () => {
  it('accepts a board with exactly the spaces its size lays out', () => {
    const board = createEmptySmallBoard();

    const result = boardLayout.safeParse(board);

    expect(result.success).toBe(true);
  });

  it('rejects a board missing a space its size lays out', () => {
    // H-12 is the far corner of a small board; take it away.
    const { 'H-12': _farCorner, ...withoutFarCorner } =
      createEmptySmallBoard().board;
    const board: Board = { board: withoutFarCorner, boardType: 'small' };

    const result = boardLayout.safeParse(board);

    expect(result.error?.issues).toMatchObject([
      {
        message: 'Missing coordinate H-12 for small board.',
        path: ['board', 'H-12'],
      },
    ]);
  });

  it('rejects a board with a space its size does not lay out', () => {
    // X-36 exists only on a large board; add it to a small one.
    const farLargeCorner = createEmptyLargeBoard().board['X-36'];
    const board: Board = {
      board: { ...createEmptySmallBoard().board, 'X-36': farLargeCorner },
      boardType: 'small',
    };

    const result = boardLayout.safeParse(board);

    expect(result.error?.issues).toMatchObject([
      {
        message: 'Unexpected coordinate X-36 for small board.',
        path: ['board', 'X-36'],
      },
    ]);
  });

  it('points each issue at the board inside a larger value', () => {
    // Inside a game, the board sits at gameState.boardState.
    const { 'H-12': _farCorner, ...withoutFarCorner } =
      createEmptySmallBoard().board;
    const board: Board = { board: withoutFarCorner, boardType: 'small' };
    const inGame = z
      .custom<Board>()
      .superRefine((value, ctx) =>
        refineBoardLayout(value, ctx, ['gameState', 'boardState']),
      );

    const result = inGame.safeParse(board);

    expect(result.error?.issues).toMatchObject([
      { path: ['gameState', 'boardState', 'board', 'H-12'] },
    ]);
  });
});
