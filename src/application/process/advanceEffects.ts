import type { GameEffectEvent } from '@events';
import type { AuthoritativeGameState } from '@game';
import type { EnginePorts, PortResponse } from '@application/ports';
import { generateEventFromProcedure } from '@procedures';
import { findExpectedEvent } from '@expected';
import { processEvent } from './processEvent';
import type { GameModeName } from '@entities';

/**
 * Advances the game state up to the next player choice.
 * Procedures need full card info, so the state must be authoritative.
 *
 * A game that has already finished owes nothing, so there is nothing to
 * advance: that is answered as a refusal, not thrown. A game that finishes
 * while advancing is a success; the loop stops because nothing more is owed.
 *
 * @param gameId - The ID of the game to advance.
 * @param gameMode - The game mode.
 * @param gameState - The current authoritative game state.
 * @param ports - The process-level dependency context.
 * @returns The result of the operation.
 */
export async function advanceEffects(
  gameId: string,
  gameMode: GameModeName,
  gameState: AuthoritativeGameState,
  ports: EnginePorts,
): Promise<PortResponse<void>> {
  let currentGameState = gameState;
  let expectedEvent = findExpectedEvent(gameState);
  if (expectedEvent === undefined) {
    const alreadyOver: PortResponse<void> = {
      errorReason: 'The game is already over',
      result: false,
    };
    return alreadyOver;
  }
  while (expectedEvent?.actionType === 'gameEffect') {
    const event: GameEffectEvent = generateEventFromProcedure(
      currentGameState,
      expectedEvent.effectType,
      ports.random,
    );
    const processResult = await processEvent(
      gameId,
      gameMode,
      event,
      currentGameState,
      ports,
    );
    if (!processResult.result) {
      return processResult;
    }
    currentGameState = processResult.data;
    // A game that has just ended owes nothing more, and the loop stops.
    expectedEvent = findExpectedEvent(currentGameState);
  }
  return {
    data: undefined,
    result: true,
  };
}
