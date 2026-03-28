import type { BoardForGameType, GameState, GameType } from '@entities';
import type { Event, EventType } from '@events';
import type {
  EventStreamStorage,
  GameStateSubscriber,
  GameStorage,
  PortResponse,
  RoundSnapshotStorage,
} from '../ports';
import { applyEvent } from '@transforms';
import { getGameState, updateGameState } from '../composable';
import { handleNewRound } from './handleNewRound';

export async function processEvent<T extends GameType>(
  gameId: string,
  gameTypeForUpdate: T,
  event: Event<BoardForGameType[T], EventType>,
  gameStorage: GameStorage,
  roundSnapshotStorage: RoundSnapshotStorage,
  eventStreamStorage: EventStreamStorage,
  gameStateSubscribers: GameStateSubscriber[],
): Promise<PortResponse<GameState<BoardForGameType[T]>>> {
  // Get the game state
  const gameState: GameState<BoardForGameType[T]> | undefined =
    await getGameState(gameId, gameTypeForUpdate, gameStorage);
  if (!gameState) {
    return {
      result: false,
      errorReason: 'Game state not initialized',
    };
  }

  // Add the event to the event stream
  eventStreamStorage.addEventToStream(
    gameId,
    gameState.currentRoundNumber,
    event,
  );

  // Apply the event to the game state
  const newGameState = applyEvent<BoardForGameType[T]>(event, gameState);

  // Persist the game state
  const updateResult = await updateGameState(
    gameId,
    gameTypeForUpdate,
    newGameState,
    gameStorage,
    gameStateSubscribers,
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
      roundSnapshotStorage,
      eventStreamStorage,
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
