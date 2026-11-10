import type { ResolveRetreatEvent } from '@events';
import type { GameState } from '@game';
import { GAME_EFFECT_EVENT_TYPE, RESOLVE_RETREAT_EFFECT_TYPE } from '@events';
import { findRetreatAwaitingMove } from '@queries';

/**
 * Carries out a retreat already decided (§9.1): the path it takes was the
 * only legal one, taken at once, or the one its owner chose among the
 * smallest (§9.1.3). The event names where the unit starts and the path;
 * where it lands follows from those, so it is not recorded twice.
 *
 * Every retreat, whatever opened it, ends here, and this event moves the
 * unit on the board.
 *
 * @param state - The current game state
 * @param eventNumber - The event's place in the round
 * @returns The retreat to carry out: the unit where it stands, and its path
 * @throws Error when no retreat has its path settled and its move still to make
 */
export function generateResolveRetreatEvent(
  state: GameState,
  eventNumber: number,
): ResolveRetreatEvent {
  const location = findRetreatAwaitingMove(state);
  if (location === undefined) {
    throw new Error('No retreat is waiting to be carried out');
  }
  const retreatState = location.retreatState;

  // The retreat to carry out was chosen, or was the only one. The selection
  // answers only with a settled path; this says so to the type as well.
  const path = retreatState.chosenRetreatPath;
  if (path === 'pending') {
    throw new Error('No retreat has been chosen yet');
  }

  const gameEffectEvent: ResolveRetreatEvent = {
    effectType: RESOLVE_RETREAT_EFFECT_TYPE,
    eventNumber,
    eventType: GAME_EFFECT_EVENT_TYPE,
    path,
    startingPosition: retreatState.retreatingUnit,
  };

  return gameEffectEvent;
}
