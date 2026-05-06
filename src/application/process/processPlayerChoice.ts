import type { ValidationResult } from "@entities";
import type { PlayerChoiceEvent } from "@events";
import type { GameState } from "@game";
import type { EnginePorts, PortResponse } from "../ports";
import { getExpectedEvent } from "@queries";
import { validatePlayerChoice } from "@validation";
import { getGameState } from "../composable";
import { processEvent } from "./processEvent";

export async function processPlayerChoice(
  gameId: string,
  playerChoice: PlayerChoiceEvent,
  ports: EnginePorts,
): Promise<PortResponse<GameState>> {
  const gameState: GameState | undefined = await getGameState(gameId, ports.gameStorage);
  if (!gameState) {
    return {
      result: false,
      errorReason: "Game state not initialized",
    };
  }

  const validation: ValidationResult = validatePlayerChoice(playerChoice, gameState);
  if (!validation.result) {
    return {
      result: false,
      errorReason: validation.errorReason,
    };
  }

  const expected = getExpectedEvent(gameState);
  if (expected.expectedEventNumber !== playerChoice.eventNumber) {
    return {
      result: false,
      errorReason: "Event number mismatch",
    };
  }

  return processEvent(gameId, playerChoice, gameState, ports);
}
