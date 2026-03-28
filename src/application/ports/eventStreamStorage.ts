import type { Board } from '@entities';
import type { Event, EventType } from '@events';
import type { PortResponse } from './portResponse';

/**
 * The port for storing and retrieving the current round's event stream.
 * The event stream is a strongly-ordered list of events that have occurred in the round.
 * Together with round snapshots,
 * it can be used to reconstruct the game state at any point in time.
 */
export interface EventStreamStorage {
  getEventStream: <TBoard extends Board>(
    gameId: string,
    roundNumber: number,
  ) => Promise<PortResponse<readonly Event<TBoard, EventType>[] | undefined>>;
  addEventToStream: <TBoard extends Board>(
    gameId: string,
    roundNumber: number,
    event: Event<TBoard, EventType>,
  ) => PortResponse<readonly Event<TBoard>[] | undefined>;
  flushEventStream: (gameId: string, roundNumber: number) => PortResponse<void>;
  newEventStream: <TBoard extends Board>(
    gameId: string,
    roundNumber: number,
  ) => PortResponse<readonly Event<TBoard, EventType>[]>;
  truncateEventStream: <TBoard extends Board>(
    gameId: string,
    roundNumber: number,
    firstEventToRemove: number,
  ) => PortResponse<readonly Event<TBoard, EventType>[]>;
}
