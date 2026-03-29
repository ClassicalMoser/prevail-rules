import type { GameType } from '@entities';
import type { Game } from '@game';
import type { GameStorage, PortResponse } from '../ports';
import { parseStoredGame } from '../utils';

/** Loads via `GameStorage` (wide types), then `parseStoredGame`; yields correlated `Game<T>`. */
export async function getGame<TGame extends GameType>(
  gameId: string,
  gameType: TGame,
  gameStorage: GameStorage,
): Promise<Game<TGame> | undefined> {
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
  return parseStoredGame(gameType, result.data) as Game<TGame>;
}
