import type { BoardType, GameModeName } from '@entities';

import { gameModes } from '@entities';
import type { z } from 'zod';

function expectedBoardSize(gameMode: GameModeName): BoardType {
  const mode = gameModes.find((m) => m.name === gameMode);
  if (!mode) {
    throw new Error(`Unknown game mode: ${gameMode}`);
  }
  return mode.boardSize;
}

/** Ensures `gameState.boardState.boardType` matches the mode catalog. */
export function refineGameModeBoardSize(
  game: {
    gameMode: GameModeName;
    gameState: { boardState: { boardType: BoardType } };
  },
  ctx: z.RefinementCtx,
): void {
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
