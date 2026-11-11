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
  // TODO(wrong): a round snapshot is a game state, but it is read with the
  // game schema, so every stored snapshot is refused. Nothing calls this yet.
  // Settled by reading it as an authoritative game state of the mode's size.
  const game = parseStoredGameForMode(gameMode.name, result.data);
  if (!game.result) {
    throw new Error(game.errorReason);
  }
  return game.data.gameState;
}
