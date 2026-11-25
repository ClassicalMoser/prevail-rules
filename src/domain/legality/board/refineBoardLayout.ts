import type { Board } from '@entities';
import type { z } from 'zod';
import { coordinateLayoutMap } from '@entities';

/**
 * Adds Zod issues when a board's spaces differ from the spaces its size lays
 * out: every space on that grid is present, and no space from another grid is.
 *
 * Each of the three board sizes is a fixed grid, depth by frontage (§2.1.3),
 * and the readers of a board look its spaces up by that grid's coordinates.
 * A board read from outside, in a game record (`refineGameRules`) or a game
 * state on its own (`legalGameStateSchema`), is checked here.
 *
 * @param board - The board, with the size it claims
 * @param ctx - Where to add each issue
 * @param pathPrefix - Where the board sits in a larger value, such as
 * `['gameState', 'boardState']` in a game, so each issue points at it.
 */
export function refineBoardLayout(
  board: Board,
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = [],
): void {
  // The grid this board's size lays out, row by column.
  const expected = new Set<string>(
    coordinateLayoutMap[board.boardType].coordinates,
  );
  // The spaces the board actually holds.
  const actual = new Set(Object.keys(board.board));

  // A space the grid has but the board lacks leaves a hole in the field.
  for (const key of expected) {
    if (!actual.has(key)) {
      ctx.addIssue({
        code: 'custom',
        message: `Missing coordinate ${key} for ${board.boardType} board.`,
        path: [...pathPrefix, 'board', key],
      });
    }
  }

  // A space the grid lacks belongs to a different board size.
  for (const key of actual) {
    if (!expected.has(key)) {
      ctx.addIssue({
        code: 'custom',
        message: `Unexpected coordinate ${key} for ${board.boardType} board.`,
        path: [...pathPrefix, 'board', key],
      });
    }
  }
}
