import type { Game } from '@game';
import type { GameStorage, RunnerResponse } from '@application/ports';
import type { GameModeName } from '@ruleValues';
import { parseLegalGameForMode, storageFailure } from '@application/utils';

/**
 * Loads a game through {@link GameStorage} and reads it with
 * {@link parseLegalGameForMode}, so everything downstream can trust it: a
 * legal game of the expected mode, authoritative by type.
 *
 * Parsing once per load costs about a millisecond for a busy epic game; it is
 * done here rather than in each storage adapter so it is enforced in one place.
 *
 * @param gameId - The ID of the game to load
 * @param gameMode - The mode the game must be in
 * @param gameStorage - The storage to load it from
 * @returns The game, or the cause and reason it could not be loaded
 */
export async function getGame(
  gameId: string,
  gameMode: GameModeName,
  gameStorage: GameStorage,
): Promise<RunnerResponse<Game>> {
  const stored = await gameStorage.getGame(gameId, gameMode);

  // Storage answering with no game, or with nothing at all, means there is
  // no game under this id.
  if (stored === undefined || (stored.result && stored.data === undefined)) {
    const notFound: RunnerResponse<Game> = {
      errorReason: `Game ${gameId} not found`,
      failure: 'gameNotFound',
      result: false,
    };
    return notFound;
  }

  // The storage itself refused or failed.
  if (!stored.result) {
    const refused = storageFailure(stored);
    return refused;
  }

  // What came back is read as a legal game of this mode, or refused as one
  // that is not.
  const game = parseLegalGameForMode(gameMode, stored.data);
  return game;
}
