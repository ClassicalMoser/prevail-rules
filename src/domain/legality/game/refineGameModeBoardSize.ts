import type { BoardType, GameModeName } from '@entities';

import { gameModes } from '@entities';
import type { z } from 'zod';

/**
 * Adds a Zod issue when a game is played on a board of the wrong size for its
 * mode: each mode is played on the board size the mode catalog gives it.
 *
 * @param path - Where the board type sits in the value being checked, so the
 * issue points at it: inside a whole game by default, or `['boardState', 'boardType']` for a bare game state.
 */
export function refineGameModeBoardSize(
  game: {
    gameMode: GameModeName;
    gameState: { boardState: { boardType: BoardType } };
  },
  ctx: z.RefinementCtx,
  path: (string | number)[] = ['gameState', 'boardState', 'boardType'],
): void {
  // The size this mode is played on, and the size this game's board is.
  const expected: BoardType = gameModes[game.gameMode].boardSize;
  const actual = game.gameState.boardState.boardType;
  if (actual !== expected) {
    ctx.addIssue({
      code: 'custom',
      message: `gameMode ${game.gameMode} requires board size ${expected}, got ${actual}.`,
      path,
    });
  }
}
