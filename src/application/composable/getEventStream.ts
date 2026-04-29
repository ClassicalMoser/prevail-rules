import type { Board } from "@entities";
import type { Event, EventType } from "@events";
import type { EventStreamStorage } from "../ports";
import { parseStoredEventStream } from "../utils";

/** Loads via `EventStreamStorage` (wide types), then `parseStoredEventStream`; yields validated events. */
export async function getEventStream(
  gameId: string,
  roundNumber: number,
  eventStreamStorage: EventStreamStorage,
): Promise<readonly Event<Board, EventType>[] | undefined> {
  const result = await eventStreamStorage.getEventStream(gameId, roundNumber);
  if (!result.result) {
    throw new Error(result.errorReason ?? "Unknown error");
  }
  if (result.data === undefined) {
    return undefined;
  }
  return parseStoredEventStream(result.data);
}
