import type { GameEffectEvent } from "@events";
import type { GameState } from "@game";
import type { EnginePorts, PortResponse } from "../ports";
import { generateEventFromProcedure } from "@procedures";
import { getExpectedEvent } from "@queries";
import { processEvent } from "./processEvent";

/**
 * Advances the game state up to the next player choice.
 *
 * @param gameId - The ID of the game to advance.
 * @param gameState - The current game state.
 * @param ports - The process-level dependency context.
 * @returns The result of the operation.
 */
export async function advanceEffects(
  gameId: string,
  gameState: GameState,
  ports: EnginePorts,
): Promise<PortResponse<void>> {
  let currentGameState = gameState;
  let expectedEvent = getExpectedEvent(gameState);
  while (expectedEvent.actionType === "gameEffect") {
    const event: GameEffectEvent = generateEventFromProcedure(
      currentGameState,
      expectedEvent.expectedEventNumber,
      expectedEvent.effectType,
    );
    const processResult = await processEvent(gameId, event, currentGameState, ports);
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
