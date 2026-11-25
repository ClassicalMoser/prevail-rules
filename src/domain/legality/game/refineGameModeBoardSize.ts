import type { BoardType, GameModeName } from '@ruleValues';

import { boardSizeByGameMode } from '@ruleValues';
import type { z } from 'zod';

/**
 * Adds a Zod issue when a game is played on a board of the wrong size for its
 * mode: each mode is played on the board size the mode catalog gives it.
 *
 * @param game - The mode, and the game state holding the board
 * @param ctx - Where to add the issue
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
  // Tutorial and Mini are played on the small board, Standard on the
  // standard one and Epic on the large (§2.1.3, §3.1.3).
  const expected: BoardType = boardSizeByGameMode[game.gameMode];
  const actual = game.gameState.boardState.boardType;

  // The mode sets the board as it sets the army limits (§3.1.3), so a game
  // on another size is not a game of that mode; the issue names both sizes.
  if (actual !== expected) {
    ctx.addIssue({
      code: 'custom',
      message: `gameMode ${game.gameMode} requires board size ${expected}, got ${actual}.`,
      path,
    });
  }
}
