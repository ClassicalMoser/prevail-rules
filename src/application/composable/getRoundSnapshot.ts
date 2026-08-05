import type { GameMode } from '@entities';
import type { GameState } from '@game';
import type { RoundSnapshotStorage } from '@application/ports';
import { parseStoredGameForMode } from '../utils/parseStoredGame';

/**
 * Loads via `RoundSnapshotStorage` (wide types), then `parseStoredGameForMode`.
 *
 * @param gameId - The ID of the game.
 * @param roundNumber - The number of the round.
 * @param gameMode - The mode of the game.
 * @param roundSnapshotStorage - The storage for round snapshots.
 * @returns The round snapshot.
 */
export async function getRoundSnapshot(
  gameId: string,
  roundNumber: number,
  gameMode: GameMode,
  roundSnapshotStorage: RoundSnapshotStorage,
): Promise<GameState | undefined> {
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
  return parseStoredGameForMode(gameMode, result.data).gameState;
}
