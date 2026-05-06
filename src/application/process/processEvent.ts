import type { GameState } from "@game";
import type { EnginePorts, PortResponse } from "../ports";
import { applyEvent } from "@transforms";
import { updateGameState } from "../composable";
import { handleNewRound } from "./handleNewRound";
import { Event } from "@events";

export async function processEvent(
  gameId: string,
  event: Event,
  gameState: GameState,
  ports: EnginePorts,
): Promise<PortResponse<GameState>> {
  const addEventResult = await ports.eventStreamStorage.addEventToStream(
    gameId,
    gameState.currentRoundNumber,
    event,
  );
  if (!addEventResult.result) {
    return {
      result: false,
      errorReason: addEventResult.errorReason,
    };
  }

  const newGameState = applyEvent(event, gameState);

  const updateResult = await updateGameState(
    gameId,
    newGameState,
    ports.gameStorage,
    ports.gameStateSubscribers,
  );
  if (!updateResult.result) {
    return {
      result: false,
      errorReason: updateResult.errorReason,
    };
  }

  // If we've just started a new round, handle the new round
  if (event.eventType === "gameEffect" && event.effectType === "completeCleanupPhase") {
    const handleNewRoundResult = await handleNewRound(gameId, newGameState, ports);
    if (!handleNewRoundResult.result) {
      return handleNewRoundResult;
    }
  }

  // If everything succeeded, return the new game state
  return {
    result: true,
    data: newGameState,
  };
}
