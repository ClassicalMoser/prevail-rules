import type { GameState } from '@game';
import type { EnginePorts, PortResponse } from '../ports';

/**
 * Called at the START of a new round.
 * Saves the round snapshot and flushes the event stream from the previous round.
 * Creates a new event stream for the current round.
 *
 * @param gameId - The ID of the game.
 * @param gameState - The current game state.
 * @param ports - The engine ports.
 * @returns The result of the operation.
 */
export async function handleNewRound(
  gameId: string,
  gameState: GameState,
  ports: EnginePorts,
): Promise<PortResponse<void>> {
  const { roundSnapshotStorage, eventStreamStorage } = ports;

  const roundSnapshotResult = await roundSnapshotStorage.saveRoundSnapshot(
    gameId,
    gameState.currentRoundNumber,
    gameState as GameState,
  );
  if (!roundSnapshotResult.result) {
    return {
      errorReason: roundSnapshotResult.errorReason,
      result: false,
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
        errorReason: eventStreamResult.errorReason,
        result: false,
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
      errorReason: newEventStreamResult.errorReason,
      result: false,
    };
  }

  // If everything succeeded, return success
  return {
    data: undefined,
    result: true,
  };
}
