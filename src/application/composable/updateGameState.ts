import type { GameState } from '@game';
import type {
  GameStateChange,
  GameStateSubscriber,
  GameStorage,
  PortResponse,
} from '../ports';
import type { GameModeName } from '@entities';

/**
 * Updates the game state for a given game and game type.
 * @param gameId - The ID of the game to update the state for.
 * @param gameMode - The mode of the game to update the state for.
 * @param gameState - The new game state to set.
 * @param gameStorage - The game storage to use.
 * @param gameStateSubscribers - The game state subscribers to notify.
 * @returns The result of the operation.
 */
export async function updateGameState(
  gameId: string,
  gameMode: GameModeName,
  gameState: GameState,
  gameStorage: GameStorage,
  gameStateSubscribers: GameStateSubscriber[],
): Promise<PortResponse<void>> {
  const updateResult = await gameStorage.updateGameState(
    gameId,
    gameState as GameState,
  );
  if (!updateResult.result) {
    return {
      errorReason: updateResult.errorReason,
      result: false,
    };
  }
  const change: GameStateChange = {
    gameId,
    gameMode,
    gameState,
  };
  for (const subscriber of gameStateSubscribers) {
    if (subscriber.gameId !== gameId) {
      continue;
    }
    try {
      subscriber.onGameStateChange(change);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      subscriber.onError(err);
      return {
        errorReason: err.message,
        result: false,
      };
    }
  }
  return {
    data: undefined,
    result: true,
  };
}
