import type { EventStreamStorage, PortResponse } from '../ports';
import { getCurrentEventNumber } from './getCurrentEventNumber';

/**
 * Gets the next event number for a given game and round.
 * @param gameId - The ID of the game to get the next event number for.
 * @param roundNumber - The round number to get the next event number for.
 * @param eventStreamStorage - The event stream storage to use.
 * @returns The result of the operation.
 */
export async function getNextEventNumber(
  gameId: string,
  roundNumber: number,
  eventStreamStorage: EventStreamStorage,
): Promise<PortResponse<number>> {
  // Get the current event number
  const currentEventNumberResult = await getCurrentEventNumber(
    gameId,
    roundNumber,
    eventStreamStorage,
  );

  // If the current event number is not found, return an error
  if (!currentEventNumberResult.result) {
    return currentEventNumberResult;
  }

  // If the current event number is undefined, return 0
  const currentEventNumber = currentEventNumberResult.data;
  if (currentEventNumber === undefined) {
    return {
      result: true,
      data: 0,
    };
  }

  // Otherwise, return the next event number
  return {
    result: true,
    data: currentEventNumber + 1,
  };
}
