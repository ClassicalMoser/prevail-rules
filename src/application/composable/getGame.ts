import type { Game } from '@game';
import type { GameStorage, PortResponse } from '@application/ports';
import type { GameModeName } from '@entities';
import { parseStoredGameForMode } from '../utils/parseStoredGame';

/**
 * Loads a game through `GameStorage` and reads it with
 * {@link parseStoredGameForMode}, so everything downstream can trust it: a
 * legal game of the expected mode, authoritative by type.
 *
 * Parsing once per load costs about a millisecond for a busy epic game; it is
 * done here rather than in each storage adapter so it is enforced in one place.
 *
 * @param gameId - The ID of the game to load
 * @param gameMode - The mode the game must be in
 * @param gameStorage - The storage to load it from
 * @returns The game, or the reason it could not be loaded
 */
export async function getGame(
  gameId: string,
  gameMode: GameModeName,
  gameStorage: GameStorage,
): Promise<PortResponse<Game>> {
  const stored = await gameStorage.getGame(gameId, gameMode);
  if (stored === undefined || (stored.result && stored.data === undefined)) {
    return { errorReason: `Game ${gameId} not found`, result: false };
  }
  if (!stored.result) {
    return stored;
  }
  const game = parseStoredGameForMode(gameMode, stored.data);
  return game;
}
