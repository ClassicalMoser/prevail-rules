import type { Event } from "@events";
import type { EventStreamStorage, PortResponse } from "../ports";

/**
 * Gets the current event number for a given game and round.
 * @param gameId - The ID of the game to get the current event number for.
 * @param roundNumber - The round number to get the current event number for.
 * @param eventStreamStorage - The event stream storage to use.
 * @returns The current event number.
 */
export async function getCurrentEventNumber(
  gameId: string,
  roundNumber: number,
  eventStreamStorage: EventStreamStorage,
): Promise<PortResponse<number | undefined>> {
  // Get the event stream
  const streamResult = await eventStreamStorage.getEventStream(gameId, roundNumber);

  // If the event stream is not found, return an error
  if (!streamResult.result) {
    return {
      result: false,
      errorReason: streamResult.errorReason,
    };
  }

  // Get the events
  const events: readonly Event[] | undefined = streamResult.data;

  // If there is no event stream, return an error
  if (!events) {
    return {
      result: false,
      errorReason: "Event stream not found",
    };
  }

  // If the event stream is empty, return undefined
  if (events.length === 0) {
    return {
      result: true,
      data: undefined,
    };
  }

  // Get the last event
  const lastEvent = events.at(-1);

  // Check that the declared number matches the index of the last event
  if (lastEvent?.eventNumber !== events.length - 1) {
    return {
      result: false,
      errorReason: "Event stream corrupted",
    };
  }

  // Return the last event number
  return {
    result: true,
    data: lastEvent.eventNumber,
  };
}
