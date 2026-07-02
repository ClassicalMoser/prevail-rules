import type { Game } from '@game';
import type { GameStorage } from '@application/ports';
import type { GameModeName } from '@entities';

/**
 * Loads via `GameStorage` (wide types), then {@link parseStoredGameForMode}.
 */
export async function getGame(
  gameId: string,
  gameMode: GameModeName,
  gameStorage: GameStorage,
): Promise<Game | undefined> {
  const result = await gameStorage.getGame(gameId, gameMode);
  if (!result || result.result === false || result.data === undefined) {
    return undefined;
  }
  return result.data;
}
