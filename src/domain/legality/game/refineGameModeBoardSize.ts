import type { BoardType, GameModeName } from '@entities';

import { gameModes } from '@entities';
import type { z } from 'zod';

/** The board size the mode catalog assigns to a game mode. */
function expectedBoardSize(gameMode: GameModeName): BoardType {
  const mode = gameModes.find((m) => m.name === gameMode);
  if (!mode) {
    throw new Error(`Unknown game mode: ${gameMode}`);
  }
  return mode.boardSize;
}

/**
 * Adds a Zod issue when a game is played on a board of the wrong size for its
 * mode: each mode is played on the board size the mode catalog gives it.
 */
export function refineGameModeBoardSize(
  game: {
    gameMode: GameModeName;
    gameState: { boardState: { boardType: BoardType } };
  },
  ctx: z.RefinementCtx,
): void {
  // The size this mode is played on, and the size this game's board is.
  const expected = expectedBoardSize(game.gameMode);
  const actual = game.gameState.boardState.boardType;
  if (actual !== expected) {
    ctx.addIssue({
      code: 'custom',
      message: `gameMode ${game.gameMode} requires board size ${expected}, got ${actual}.`,
      path: ['gameState', 'boardState', 'boardType'],
    });
  }
}
