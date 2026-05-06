import type { Event } from "@events";
import type { PortResponse } from "./portResponse";

/**
 * The port for storing and retrieving the current round's event stream.
 * The event stream is a strongly-ordered list of events that have occurred in the round.
 * Together with round snapshots,
 * it can be used to reconstruct the game state at any point in time.
 */
export interface EventStreamStorage {
  getEventStream: (
    gameId: string,
    roundNumber: number,
  ) => Promise<PortResponse<readonly Event[] | undefined>>;
  addEventToStream: (
    gameId: string,
    roundNumber: number,
    event: Event,
  ) => Promise<PortResponse<readonly Event[] | undefined>>;
  flushEventStream: (gameId: string, roundNumber: number) => Promise<PortResponse<void>>;
  newEventStream: (gameId: string, roundNumber: number) => Promise<PortResponse<readonly Event[]>>;
  truncateEventStream: (
    gameId: string,
    roundNumber: number,
    firstEventToRemove: number,
  ) => Promise<PortResponse<readonly Event[]>>;
}
