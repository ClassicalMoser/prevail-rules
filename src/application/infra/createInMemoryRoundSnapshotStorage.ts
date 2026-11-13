import type { GameState } from '@game';
import type { PortResponse, RoundSnapshotStorage } from '@application/ports';

/**
 * A `RoundSnapshotStorage` that keeps, in memory, the state each round of
 * each game began with.
 *
 * @returns A snapshot storage holding no snapshots
 */
export function createInMemoryRoundSnapshotStorage(): RoundSnapshotStorage {
  const snapshots = new Map<string, GameState>();

  const storage: RoundSnapshotStorage = {
    getRoundSnapshot: async (gameId, roundNumber) => {
      // A round with no snapshot answers none.
      const found: PortResponse<unknown> = {
        data: snapshots.get(`${gameId}/${roundNumber}`),
        result: true,
      };
      return found;
    },

    saveRoundSnapshot: async (gameId, roundNumber, gameState) => {
      // A round begins once, so its snapshot is simply set.
      snapshots.set(`${gameId}/${roundNumber}`, gameState);
      const saved: PortResponse<void> = { data: undefined, result: true };
      return saved;
    },
  };

  // Both operations share the one map.
  return storage;
}
