import type { BoardForGameType, GameState, GameType } from '@entities';
import type {
  EventStreamStorage,
  PortResponse,
  RoundSnapshotStorage,
} from '../ports';

/**
 * Called at the START of a new round.
 * Saves the round snapshot and flushes the event stream from the previous round.
 * Creates a new event stream for the current round.
 *
 * @param gameId - The ID of the game.
 * @param gameState - The current game state.
 * @param roundSnapshotStorage - The round snapshot storage.
 * @param eventStreamStorage - The event stream storage.
 * @returns The result of the operation.
 */
export async function handleNewRound<T extends GameType>(
  gameId: string,
  gameState: GameState<BoardForGameType[T]>,
  roundSnapshotStorage: RoundSnapshotStorage,
  eventStreamStorage: EventStreamStorage,
): Promise<PortResponse<void>> {
  // Save the round snapshot
  const roundSnapshotResult = await roundSnapshotStorage.saveRoundSnapshot(
    gameId,
    gameState.currentRoundNumber,
    gameState,
  );
  if (!roundSnapshotResult.result) {
    return {
      result: false,
      errorReason: roundSnapshotResult.errorReason,
    };
  }

  // If this is not the first round, flush the event stream from the previous round
  if (gameState.currentRoundNumber > 1) {
    const eventStreamResult = await eventStreamStorage.flushEventStream(
      gameId,
      gameState.currentRoundNumber - 1,
    );
    if (!eventStreamResult.result) {
      return {
        result: false,
        errorReason: eventStreamResult.errorReason,
      };
    }
  }

  // Create a new event stream for the current round
  const newEventStreamResult = await eventStreamStorage.newEventStream(
    gameId,
    gameState.currentRoundNumber,
  );
  if (!newEventStreamResult.result) {
    return {
      result: false,
      errorReason: newEventStreamResult.errorReason,
    };
  }

  // If everything succeeded, return success
  return {
    result: true,
    data: undefined,
  };
}
