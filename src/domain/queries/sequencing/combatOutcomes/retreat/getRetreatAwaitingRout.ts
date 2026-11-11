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
 * @throws Error when no retreat is waiting to turn into a rout, or when the one
 * waiting is a front engagement's, which no game reaches
 */
export function getRetreatAwaitingRout(state: GameState): RetreatLocation {
  const location = findRetreatAwaitingRout(state);
  if (location === undefined) {
    throw new Error('No retreat with nowhere to go is waiting for its rout');
  }
  // A front-engaged defender is offered the retreat only when it has one to
  // make (§6.3.2), so a retreat it gave ground to always has a path.
  if (location.source === 'frontEngagement') {
    throw new Error('A front engagement retreat always has a legal path');
  }
  return location;
}
