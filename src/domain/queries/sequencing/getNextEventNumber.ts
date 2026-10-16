import type { GameState } from '@game';
import { getCurrentEventStream } from './getCurrentEventStream';

/**
 * Gets the next event number for the given game state.
 *
 * The next number is the length of the current round's event stream: the
 * index the next append will occupy. A stream built by appending is
 * `0 .. length - 1`. This does not inspect the `eventNumber` fields already
 * stored on those events.
 *
 * @param gameState - The game state
 * @returns The next event number
 */
export function getNextEventNumber(gameState: GameState): number {
  const eventStream = getCurrentEventStream(gameState);
  return eventStream.length;
}
