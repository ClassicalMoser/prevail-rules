import type { BoardForGameType, GameState, GameType } from '@entities';
import type { GameEffectEvent, GameEffectType } from '@events';
import type {
  EventStreamStorage,
  GameStateSubscriber,
  GameStorage,
  PortResponse,
  RoundSnapshotStorage,
} from '../ports';
import { generateEventFromProcedure } from '@procedures';
import { getExpectedEvent } from '@queries';
import { getNextEventNumber, updateGameState } from '../composable';
import { processEvent } from './processEvent';

/**
 * Advances the game state up to the next player choice.
 *
 * @param gameId - The ID of the game to advance.
 * @param gameTypeForUpdate - The type of the game to update.
 * @param gameState - The current game state.
 * @param gameStorage - The game storage to use.
 * @param roundSnapshotStorage - The round snapshot storage to use.
 * @param eventStreamStorage - The event stream storage to use.
 * @param gameStateSubscribers - The game state subscribers to use.
 * @returns The result of the operation.
 */
export async function advanceEffects<T extends GameType>(
  gameId: string,
  gameTypeForUpdate: T,
  gameState: GameState<BoardForGameType[T]>,
  gameStorage: GameStorage,
  roundSnapshotStorage: RoundSnapshotStorage,
  eventStreamStorage: EventStreamStorage,
  gameStateSubscribers: GameStateSubscriber[],
): Promise<PortResponse<void>> {
  let currentGameState = gameState;
  let expectedEvent = getExpectedEvent(gameState);
  let nextEventNumber = await getNextEventNumber(
    gameId,
    gameState.currentRoundNumber,
    eventStreamStorage,
  );
  while (expectedEvent.actionType === 'gameEffect') {
    if (!nextEventNumber.result) {
      return nextEventNumber;
    }
    const event: GameEffectEvent<BoardForGameType[T], GameEffectType> =
      generateEventFromProcedure(
        currentGameState,
        nextEventNumber.data,
        expectedEvent.effectType,
      );
    const processResult: PortResponse<GameState<BoardForGameType[T]>> =
      await processEvent(
        gameId,
        gameTypeForUpdate,
        event,
        gameStorage,
        roundSnapshotStorage,
        eventStreamStorage,
        gameStateSubscribers,
      );
    if (!processResult.result) {
      return processResult;
    }
    currentGameState = processResult.data;
    const updateResult = await updateGameState(
      gameId,
      gameTypeForUpdate,
      currentGameState,
      gameStorage,
      gameStateSubscribers,
    );
    if (!updateResult.result) {
      return updateResult;
    }
    expectedEvent = getExpectedEvent(currentGameState);
    nextEventNumber = await getNextEventNumber(
      gameId,
      currentGameState.currentRoundNumber,
      eventStreamStorage,
    );
  }
  return {
    result: true,
    data: undefined,
  };
}
