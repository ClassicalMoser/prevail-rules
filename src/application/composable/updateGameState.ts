import type { GameType } from '@entities';
import type { BoardForGameType, GameState, GameStateWithBoard } from '@game';
import type {
  GameStateChange,
  GameStateSubscriber,
  GameStorage,
  PortResponse,
} from '../ports';

/**
 * Updates the game state for a given game and game type.
 * @param gameId - The ID of the game to update the state for.
 * @param gameType - The type of the game to update the state for.
 * @param gameState - The new game state to set.
 * @param gameStorage - The game storage to use.
 * @param gameStateSubscribers - The game state subscribers to notify.
 * @returns The result of the operation.
 */
export async function updateGameState<T extends GameType>(
  gameId: string,
  gameType: T,
  gameState: GameStateWithBoard<BoardForGameType[T]>,
  gameStorage: GameStorage,
  gameStateSubscribers: GameStateSubscriber[],
): Promise<PortResponse<void>> {
  const updateResult = await gameStorage.updateGameState(
    gameId,
    gameState as GameState,
  );
  if (!updateResult.result) {
    return {
      result: false,
      errorReason: updateResult.errorReason,
    };
  }
  const change: GameStateChange = {
    gameId,
    gameType,
    gameState,
  };
  for (const subscriber of gameStateSubscribers) {
    if (subscriber.gameId !== gameId || subscriber.gameType !== gameType) {
      continue;
    }
    try {
      subscriber.onGameStateChange(change);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      subscriber.onError(err);
      return {
        result: false,
        errorReason: err.message,
      };
    }
  }
  return {
    result: true,
    data: undefined,
  };
}
