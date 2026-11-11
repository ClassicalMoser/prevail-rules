import type { GameState } from '@game';
import type { RetreatLocation } from './findRetreatLocation';
import { findRetreatAwaitingRout } from './findRetreatAwaitingRout';

/**
 * The retreat with nowhere to go whose rout has not opened yet, with the
 * parent holding it: the one `triggerRoutFromRetreat` is owed for (§9.1.6).
 * Asking when there is none is a fault in whoever asked.
 *
 * @param state - The game state
 * @returns The retreat awaiting its rout and its parent
 * @throws Error when no retreat is waiting to turn into a rout
 */
export function getRetreatAwaitingRout(state: GameState): RetreatLocation {
  const location = findRetreatAwaitingRout(state);
  if (location === undefined) {
    throw new Error('No retreat with nowhere to go is waiting for its rout');
  }
  return location;
}
