import type { Event } from '@events';
import type { GameState } from '@game';
import type {
  GameStateChange,
  GameStateSubscriber,
  GameStorage,
  PortResponse,
} from '@application/ports';
import type { GameModeName } from '@entities';

/**
 * Records an event the game has taken: it joins the end of the stored game's
 * stream, the state it led to becomes the game's state, and the game's
 * subscribers are told of the new state.
 *
 * @param gameId - The ID of the game
 * @param gameMode - The mode of the game, which subscribers are matched on
 * @param event - The event the game has taken
 * @param gameState - The state that event led to
 * @param gameStorage - The game storage to record it in
 * @param gameStateSubscribers - The game state subscribers to notify
 * @returns The result of the operation
 */
export async function recordEvent(
  gameId: string,
  gameMode: GameModeName,
  event: Event,
  gameState: GameState,
  gameStorage: GameStorage,
  gameStateSubscribers: GameStateSubscriber[],
): Promise<PortResponse<void>> {
  const updateResult = await gameStorage.recordEvent(gameId, event, gameState);
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
