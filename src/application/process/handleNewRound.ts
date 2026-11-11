import type { GameState } from '@game';
import type { EnginePorts, PortResponse } from '@application/ports';

/**
 * Called at the START of a new round, round 1 or later.
 * Saves the round snapshot and flushes the event stream from the previous round,
 * which for round 1 is round 0, setup.
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
  // The round that has just begun: round 1 when setup is done.
  const roundNumber = gameState.currentRoundState.roundNumber;

  const roundSnapshotResult = await roundSnapshotStorage.saveRoundSnapshot(
    gameId,
    roundNumber,
    gameState,
  );
  if (!roundSnapshotResult.result) {
    return {
      errorReason: roundSnapshotResult.errorReason,
      result: false,
    };
  }

  // The round before is over, round 0 (setup) included, so its stream is
  // flushed. A round begins only after another ends, so there always is one.
  const eventStreamResult = await eventStreamStorage.flushEventStream(
    gameId,
    roundNumber - 1,
  );
  if (!eventStreamResult.result) {
    return {
      errorReason: eventStreamResult.errorReason,
      result: false,
    };
  }

  // Create a new event stream for the current round
  const newEventStreamResult = await eventStreamStorage.newEventStream(
    gameId,
    roundNumber,
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
