import type { Board } from '@entities';
import type { z } from 'zod';
import { getCoordinateLayout } from '@factories';

/**
 * Adds Zod issues when a board's spaces differ from the spaces its size lays
 * out: every space on that grid is present, and no space from another grid is.
 *
 * @param pathPrefix - Where the board sits in a larger value, such as
 * `['gameState', 'boardState']` in a game, so each issue points at it.
 */
export function refineBoardLayout(
  board: Board,
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = [],
): void {
  // The grid this board's size lays out, row by column.
  const layout = getCoordinateLayout(board);
  const expected = new Set<string>(
    layout.rowLetters.flatMap((row) =>
      layout.columnNumbers.map((column) =>
        layout.createCoordinate(row, column),
      ),
    ),
  );
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
