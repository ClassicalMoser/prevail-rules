import type { GameType } from '@entities';
import type { GameEffectEvent, GameEffectType } from '@events';
import type { BoardForGameType, GameStateWithBoard } from '@game';
import type { EnginePorts, PortResponse } from '../ports';
import { generateEventFromProcedure } from '@procedures';
import { getExpectedEvent } from '@queries';
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
  gameState: GameStateWithBoard<BoardForGameType<T>>,
  ports: EnginePorts,
): Promise<PortResponse<void>> {
  let currentGameState = gameState;
  let expectedEvent = getExpectedEvent(gameState);
  while (expectedEvent.actionType === 'gameEffect') {
    const event: GameEffectEvent<
      BoardForGameType<T>,
      GameEffectType
    > = generateEventFromProcedure(
      currentGameState,
      expectedEvent.eventNumber,
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
  }
  return {
    result: true,
    data: undefined,
  };
}
