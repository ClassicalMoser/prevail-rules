import type { GameMode } from '@entities';
import type { Game, GameForVisibility } from '@game';
import {
  authoritativeGameWithArmyCompositionSchema,
  gameWithArmyCompositionSchema,
} from '@validation';

/**
 * **Boundary:** validates untrusted / stored data and returns a typed {@link Game}.
 * Call after `GameStorage.getGame` (or equivalent) so downstream code can trust the shape.
 */

/**
 * Interpret stored JSON as an authoritative game, then check `gameMode` matches.
 */
export function parseStoredGameForMode(
  gameMode: GameMode,
  data: unknown,
): GameForVisibility<'authoritative'> {
  const game = authoritativeGameWithArmyCompositionSchema.parse(data);
  if (game.gameMode !== gameMode.name) {
    throw new Error(
      `Stored game mode mismatch: expected ${gameMode.name}, got ${game.gameMode}`,
    );
  }
  return game;
}

/** Broad version of {@link parseStoredGameForMode} that accepts any visibility. */
export function parseStoredGame(data: unknown): Game {
  return gameWithArmyCompositionSchema.parse(data);
}
