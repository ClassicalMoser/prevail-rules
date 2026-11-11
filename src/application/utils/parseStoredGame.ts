import type { GameModeName } from '@entities';
import type { Game } from '@game';
import type { PortResponse } from '@application/ports';
import { legalGameSchema } from '@validation';
import { z } from 'zod';

/**
 * **Boundary:** reads stored data as a {@link Game}: the shape, the game
 * rules, and the mode the caller expects. A game that fails any of them is
 * refused with the reason, not thrown.
 *
 * @param gameMode - The mode the caller expects the game to be in
 * @param data - The stored game, untrusted
 * @returns The game, or the reason it is not a legal game of that mode
 */
export function parseStoredGameForMode(
  gameMode: GameModeName,
  data: unknown,
): PortResponse<Game> {
  const parsed = legalGameSchema.safeParse(data);
  if (!parsed.success) {
    return {
      errorReason: `Stored game is not a legal game: ${z.prettifyError(parsed.error)}`,
      result: false,
    };
  }
  if (parsed.data.gameMode !== gameMode) {
    return {
      errorReason: `Stored game mode mismatch: expected ${gameMode}, got ${parsed.data.gameMode}`,
      result: false,
    };
  }
  return { data: parsed.data, result: true };
}
