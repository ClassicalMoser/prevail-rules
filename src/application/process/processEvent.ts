import type { GameType } from '@entities';
import type { Event, EventType } from '@events';
import type { BoardForGameType, GameStateWithBoard } from '@game';
import type { EnginePorts, PortResponse } from '../ports';
import { applyEvent } from '@transforms';
import { updateGameState } from '../composable';
import { handleNewRound } from './handleNewRound';

export async function processEvent<T extends GameType>(
  gameId: string,
  gameTypeForUpdate: T,
  event: Event<BoardForGameType<T>, EventType>,
  gameState: GameStateWithBoard<BoardForGameType<T>>,
  ports: EnginePorts,
): Promise<PortResponse<GameStateWithBoard<BoardForGameType<T>>>> {
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

  const newGameState = applyEvent<BoardForGameType<T>>(event, gameState);

  const updateResult = await updateGameState(
    gameId,
    gameTypeForUpdate,
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
  if (
    event.eventType === 'gameEffect' &&
    event.effectType === 'completeCleanupPhase'
  ) {
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
    result: true,
    data: newGameState,
  };
}
