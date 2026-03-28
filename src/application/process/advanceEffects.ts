import type { BoardForGameType, GameState, GameType } from '@entities';
import type { GameEffectEvent, GameEffectType } from '@events';
import type { EnginePorts, PortResponse } from '../ports';
import { generateEventFromProcedure } from '@procedures';
import { getExpectedEvent } from '@queries';
import { getNextEventNumber } from '../composable';
import { processEvent } from './processEvent';

/**
 * Advances the game state up to the next player choice.
 *
 * @param gameId - The ID of the game to advance.
 * @param gameTypeForUpdate - The type of the game to update.
 * @param gameState - The current game state.
 * @param ports - The process-level dependency context.
 * @returns The result of the operation.
 */
export async function advanceEffects<T extends GameType>(
  gameId: string,
  gameTypeForUpdate: T,
  gameState: GameState<BoardForGameType[T]>,
  ports: EnginePorts,
): Promise<PortResponse<void>> {
  let currentGameState = gameState;
  let expectedEvent = getExpectedEvent(gameState);
  let nextEventNumber = await getNextEventNumber(
    gameId,
    gameState.currentRoundNumber,
    ports.eventStreamStorage,
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
    const processResult = await processEvent(
      gameId,
      gameTypeForUpdate,
      event,
      currentGameState,
      ports,
    );
    if (!processResult.result) {
      return processResult;
    }
    currentGameState = processResult.data;
    expectedEvent = getExpectedEvent(currentGameState);
    nextEventNumber = await getNextEventNumber(
      gameId,
      currentGameState.currentRoundNumber,
      ports.eventStreamStorage,
    );
  }
  return {
    result: true,
    data: undefined,
  };
}
