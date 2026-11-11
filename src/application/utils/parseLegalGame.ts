import type { GameModeName } from '@entities';
import type { Game, GameStateForVisibility } from '@game';
import type { PortResponse } from '@application/ports';
import { legalGameSchema, legalGameStateSchema } from '@validation';
import { z } from 'zod';

/**
 * **Boundary:** reads data as a {@link Game}: the shape, the game rules, and
 * the mode the caller expects. A game that fails any of them is refused with
 * the reason, not thrown. Used for a game coming out of storage and for a
 * game about to go into it, so the two cannot disagree about what is legal.
 *
 * @param gameMode - The mode the caller expects the game to be in
 * @param data - The game, untrusted
 * @returns The game, or the reason it is not a legal game of that mode
 */
export function parseLegalGameForMode(
  gameMode: GameModeName,
  data: unknown,
): PortResponse<Game> {
  const parsed = legalGameSchema.safeParse(data);
  if (!parsed.success) {
    return {
      errorReason: `Not a legal game: ${z.prettifyError(parsed.error)}`,
      result: false,
    };
  }
  if (parsed.data.gameMode !== gameMode) {
    return {
      errorReason: `Game mode mismatch: expected ${gameMode}, got ${parsed.data.gameMode}`,
      result: false,
    };
  }
  return { data: parsed.data, result: true };
}

/**
 * **Boundary:** reads stored data as the authoritative game state of a game
 * in `gameMode`: the shape, a board laid out for its size, and the size the
 * mode is played on. A round snapshot is a game state, not a whole game.
 *
 * @param gameMode - The mode the snapshot's game is played in
 * @param data - The stored game state, untrusted
 * @returns The game state, or the reason it is not a legal one for that mode
 */
export function parseLegalGameStateForMode(
  gameMode: GameModeName,
  data: unknown,
): PortResponse<GameStateForVisibility<'authoritative'>> {
  const parsed = legalGameStateSchema(gameMode).safeParse(data);
  if (!parsed.success) {
    return {
      errorReason: `Not a legal game state: ${z.prettifyError(parsed.error)}`,
      result: false,
    };
  }
  return { data: parsed.data, result: true };
}
