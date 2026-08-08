import type { GameState, OwnedPlayerForGameState } from '@game';
import type { EnginePorts, PortResponse } from '@application/ports';
import { applyEvent } from '@transforms';
import { updateGameState } from '@application/composable';
import { handleNewRound } from './handleNewRound';
import type { GameEffectEvent, PlayerChoiceEvent } from '@events';
import type { GameModeName } from '@entities';

export async function processEvent<S extends GameState>(
  gameId: string,
  gameMode: GameModeName,
  event:
    | GameEffectEvent
    | (PlayerChoiceEvent & { player: OwnedPlayerForGameState<S> }),
  gameState: S,
  ports: EnginePorts,
): Promise<PortResponse<S>> {
  const addEventResult = await ports.eventStreamStorage.addEventToStream(
    gameId,
    gameState.currentRoundNumber,
    event,
  );
  if (!addEventResult.result) {
    return {
      errorReason: addEventResult.errorReason,
      result: false,
    };
  }

  const newGameState = applyEvent(event, gameState);

  const updateResult = await updateGameState(
    gameId,
    gameMode,
    newGameState,
    ports.gameStorage,
    ports.gameStateSubscribers,
  );
  if (!updateResult.result) {
    return {
      errorReason: updateResult.errorReason,
      result: false,
    };
  }

  // Round advance (cleanup → next round, or setup → round 1)
  if (newGameState.currentRoundNumber !== gameState.currentRoundNumber) {
    const handleNewRoundResult = await handleNewRound(
      gameId,
      newGameState,
      ports,
    );
    if (!handleNewRoundResult.result) {
      return handleNewRoundResult;
    }
  }

  // If everything succeeded, return the new game state
  return {
    data: newGameState,
    result: true,
  };
}
