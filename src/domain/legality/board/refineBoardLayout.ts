import type { Board } from '@entities';
import type { z } from 'zod';
import { coordinateLayoutMap } from '@ruleValues';

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
 * @returns Whether the board is laid out as its size, so that later checks
 * may look its spaces up
 */
export function refineBoardLayout(
  board: Board,
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = [],
): boolean {
  // The grid this board's size lays out, row by column.
  const expected = new Set<string>(
    coordinateLayoutMap[board.boardType].coordinates,
  );
  // The spaces the board actually holds.
  const actual = new Set(Object.keys(board.board));

  // A space the grid has but the board lacks leaves a hole in the field.
  const missing = [...expected].filter((key) => !actual.has(key));
  for (const key of missing) {
    ctx.addIssue({
      code: 'custom',
      message: `Missing coordinate ${key} for ${board.boardType} board.`,
      path: [...pathPrefix, 'board', key],
    });
  }

  // A space the grid lacks belongs to a different board size.
  const unexpected = [...actual].filter((key) => !expected.has(key));
  for (const key of unexpected) {
    ctx.addIssue({
      code: 'custom',
      message: `Unexpected coordinate ${key} for ${board.boardType} board.`,
      path: [...pathPrefix, 'board', key],
    });
  }

  // Laid out when nothing is missing and nothing is out of place.
  const laidOut = missing.length === 0 && unexpected.length === 0;
  return laidOut;
}
