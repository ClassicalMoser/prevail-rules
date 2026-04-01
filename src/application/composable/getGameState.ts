import type { GameType } from '@entities';
import type { BoardForGameType, GameStateWithBoard } from '@game';
import type { GameStorage } from '../ports';
import { getGame } from './getGame';

export async function getGameState<T extends GameType>(
  gameId: string,
  gameType: T,
  gameStorage: GameStorage,
): Promise<GameStateWithBoard<BoardForGameType<T>> | undefined> {
  const game = await getGame(gameId, gameType, gameStorage);
  if (!game) {
    return undefined;
  }
  return game.gameState as GameStateWithBoard<BoardForGameType<T>>;
}
