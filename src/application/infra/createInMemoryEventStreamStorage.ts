import type { Event } from '@events';
import type { EventStreamStorage, PortResponse } from '@application/ports';

/** The key a round's stream is kept under: the game, then the round. */
function streamKey(gameId: string, roundNumber: number): string {
  // Round numbers are whole, so the separator cannot be confused.
  const key = `${gameId}/${roundNumber}`;
  return key;
}

/** The refusal for a round whose stream was never opened. */
function noStream(gameId: string, roundNumber: number): PortResponse<never> {
  // Streams are opened with `newEventStream`; nothing opens one implicitly.
  const missing: PortResponse<never> = {
    errorReason: `No event stream for game ${gameId}, round ${roundNumber}`,
    result: false,
  };
  return missing;
}

/**
 * An `EventStreamStorage` that keeps each round's events in memory, in the
 * order they were added. A stream must be opened before events are added to
 * it, as a new game opens round 0's and each new round opens its own.
 *
 * @returns An event stream storage holding no streams
 */
export function createInMemoryEventStreamStorage(): EventStreamStorage {
  const streams = new Map<string, Event[]>();

  const storage: EventStreamStorage = {
    addEventToStream: async (gameId, roundNumber, event) => {
      const stream = streams.get(streamKey(gameId, roundNumber));

      // An event can only join a stream that has been opened.
      if (stream === undefined) {
        const missing = noStream(gameId, roundNumber);
        return missing;
      }

      // The event goes on the end; the answer is the stream as it now stands.
      stream.push(event);
      const added: PortResponse<readonly Event[]> = {
        data: [...stream],
        result: true,
      };
      return added;
    },

    flushEventStream: async (gameId, roundNumber) => {
      const key = streamKey(gameId, roundNumber);

      // Only an open stream can be flushed.
      if (!streams.has(key)) {
        const missing = noStream(gameId, roundNumber);
        return missing;
      }

      // In memory there is nowhere further to write it, so flushing drops it.
      streams.delete(key);
      const flushed: PortResponse<void> = { data: undefined, result: true };
      return flushed;
    },

    getEventStream: async (gameId, roundNumber) => {
      // A round with no open stream answers none.
      const stream = streams.get(streamKey(gameId, roundNumber));
      const found: PortResponse<readonly Event[] | undefined> = {
        data: stream === undefined ? undefined : [...stream],
        result: true,
      };
      return found;
    },

    newEventStream: async (gameId, roundNumber) => {
      // A round's stream starts empty; opening it again starts it afresh.
      streams.set(streamKey(gameId, roundNumber), []);
      const opened: PortResponse<readonly Event[]> = { data: [], result: true };
      return opened;
    },

    truncateEventStream: async (gameId, roundNumber, firstEventToRemove) => {
      const key = streamKey(gameId, roundNumber);
      const stream = streams.get(key);

      // Only an open stream can be cut back.
      if (stream === undefined) {
        const missing = noStream(gameId, roundNumber);
        return missing;
      }

      // Keep the events before the first one to remove.
      const kept = stream.slice(0, firstEventToRemove);
      streams.set(key, kept);
      const truncated: PortResponse<readonly Event[]> = {
        data: [...kept],
        result: true,
      };
      return truncated;
    },
  };

  // Every operation shares the one map of streams.
  return storage;
}
