import type { Event } from '@events';
import type { GameState } from '@game';
import type {
  GameStateChange,
  GameStateSubscriber,
  GameStorage,
  PortResponse,
} from '@application/ports';
import type { GameModeName } from '@entities';
import { notifySubscribers } from './notifySubscribers';

/**
 * Records an event the game has taken: it joins the end of the stored game's
 * stream, the state it led to becomes the game's state, and the game's
 * subscribers are told of the new state. A subscriber that fails is told
 * through its `onError`; the event stays recorded and the answer is success.
 *
 * @param gameId - The ID of the game
 * @param gameMode - The mode of the game, which subscribers are matched on
 * @param event - The event the game has taken
 * @param gameState - The state that event led to
 * @param gameStorage - The game storage to record it in
 * @param gameStateSubscribers - The game state subscribers to notify
 * @returns Success once the event is stored, or the storage's reason it was not
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

  // The event is in the game's stream, so the game has taken it. Its
  // subscribers are told now, and none of them can undo that.
  const change: GameStateChange = {
    gameId,
    gameMode,
    gameState,
  };
  notifySubscribers(change, gameStateSubscribers);

  // The event is recorded.
  return {
    data: undefined,
    result: true,
  };
}
