import type { Board, GameState } from '@entities';
import type { PortResponse } from './portResponse';

/**
 * The port for storing and retrieving round snapshots.
 * Round snapshots are the game state at the end of a round.
 * This will usually be implemented by the table of a database.
 * For client-side use, a simple in-memory map will suffice.
 */
export interface RoundSnapshotStorage {
  getRoundSnapshot: <TBoard extends Board>(
    gameId: string,
    roundNumber: number,
  ) => Promise<PortResponse<GameState<TBoard> | undefined>>;
  saveRoundSnapshot: <TBoard extends Board>(
    gameId: string,
    roundNumber: number,
    gameState: GameState<TBoard>,
  ) => Promise<PortResponse<void>>;
}
