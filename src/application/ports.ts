import type { Board, Game, GameState } from '@entities';
import type { Event, EventType } from '@events';

export interface GameStorage {
  getGame: (gameId: string) => Promise<Game | undefined>;
  saveGame: (game: Game) => Promise<boolean>;
}

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
  ) => Promise<GameState<TBoard> | undefined>;
  saveRoundSnapshot: <TBoard extends Board>(
    gameId: string,
    gameState: GameState<TBoard>,
  ) => Promise<boolean>;
}

/**
 * The port for storing and retrieving the current round's event stream.
 * The event stream is a strongly-ordered list of events that have occurred in the round.
 * It can be used to reconstruct the game state at any point in time.
 * Between round snapshots and an event stream, any point in time can be reconstructed.
 */
export interface EventStreamStorage {
  getEventStream: <TBoard extends Board>(
    gameId: string,
    roundNumber: number,
  ) => Promise<readonly Event<TBoard, EventType>[]>;
  saveEventStream: <TBoard extends Board>(
    gameId: string,
    roundNumber: number,
    eventStream: readonly Event<TBoard, EventType>[],
  ) => Promise<boolean>;
}
