import type { GameType } from '@entities';
import type { Game, GameOfType } from '@game';
import type { GameStorage, PortResponse } from '../ports';
import { parseStoredGame } from '../utils';

/** Loads via `GameStorage` (wide types), then `parseStoredGame`; yields {@link GameOfType}. */
export async function getGame<TGame extends GameType>(
  gameId: string,
  gameType: TGame,
  gameStorage: GameStorage,
): Promise<GameOfType<TGame> | undefined> {
  const result: PortResponse<Game | undefined> = await gameStorage.getGame(
    gameId,
    gameType,
  );
  if (!result.result) {
    throw new Error(result.errorReason ?? 'Unknown error');
  }
  if (result.data === undefined) {
    return undefined;
  }
  return parseStoredGame(gameType, result.data) as GameOfType<TGame>;
}
