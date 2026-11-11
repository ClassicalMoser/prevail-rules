import type { GameMode } from '@entities';
import type { AuthoritativeGameState } from '@game';
import type { RoundSnapshotStorage } from '@application/ports';
import { parseLegalGameStateForMode } from '../utils/parseLegalGame';

/**
 * Loads a round snapshot through `RoundSnapshotStorage` and reads it as the
 * authoritative game state of a game in `gameMode`, so everything downstream
 * can trust it.
 *
 * @param gameId - The ID of the game.
 * @param roundNumber - The number of the round.
 * @param gameMode - The mode of the game.
 * @param roundSnapshotStorage - The storage for round snapshots.
 * @returns The round snapshot, or `undefined` when none is stored.
 * @throws Error when storage fails, or when the stored snapshot is not a legal game state of the mode
 */
export async function getRoundSnapshot(
  gameId: string,
  roundNumber: number,
  gameMode: GameMode,
  roundSnapshotStorage: RoundSnapshotStorage,
): Promise<AuthoritativeGameState | undefined> {
  const result = await roundSnapshotStorage.getRoundSnapshot(
    gameId,
    roundNumber,
  );
  if (!result.result) {
    throw new Error(result.errorReason ?? 'Unknown error');
  }
  if (result.data === undefined) {
    return undefined;
  }
  const snapshot = parseLegalGameStateForMode(gameMode.name, result.data);
  if (!snapshot.result) {
    throw new Error(snapshot.errorReason);
  }
  return snapshot.data;
}
