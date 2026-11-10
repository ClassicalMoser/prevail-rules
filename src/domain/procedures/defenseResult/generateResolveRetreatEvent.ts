import type { ResolveRetreatEvent } from '@events';
import type { GameState, RetreatState } from '@game';
import { GAME_EFFECT_EVENT_TYPE, RESOLVE_RETREAT_EFFECT_TYPE } from '@events';
import {
  getCurrentPhaseState,
  getFrontEngagementRetreatState,
  getRangedAttackRetreatState,
  getNextMeleeRetreatStateAwaitingMove,
} from '@queries';

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
 */
export function generateResolveRetreatEvent(
  state: GameState,
  eventNumber: number,
): ResolveRetreatEvent {
  const phaseState = getCurrentPhaseState(state);

  let retreatState: RetreatState;
  if (phaseState.phase === 'issueCommands') {
    // TODO(composition): any ranged fault, including a retreat not yet opened,
    // falls through to the front engagement. `findRetreatState` walks both
    // parents without throwing but needs a player. Settled by passing the
    // retreating player, or a player-free total query.
    try {
      retreatState = getRangedAttackRetreatState(state);
    } catch {
      retreatState = getFrontEngagementRetreatState(state);
    }
  } else if (phaseState.phase === 'resolveMelee') {
    retreatState = getNextMeleeRetreatStateAwaitingMove(state);
  } else {
    throw new Error(
      `Retreat resolution not expected in phase: ${phaseState.phase}`,
    );
  }

  // The retreat to carry out was chosen, or was the only one.
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
