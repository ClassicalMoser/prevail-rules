import type { ExpectedEventInfo } from '@events';
import type { GameState } from '@game';
import { getExpectedEvent } from './getExpectedEvent';

/**
 * The event the game expects next, or `undefined` once it has no next event.
 *
 * @param state - The game state.
 * @returns What is expected next.
 */
export function findExpectedEvent(
  state: GameState,
): ExpectedEventInfo | undefined {
  return getExpectedEvent(state);
}
