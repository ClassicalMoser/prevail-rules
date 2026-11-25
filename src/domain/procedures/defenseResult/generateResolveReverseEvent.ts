import type { ResolveReverseEvent } from '@events';
import type { GameState, ReverseState } from '@game';
import { canReverseUnit } from '@legality';
import { GAME_EFFECT_EVENT_TYPE, RESOLVE_REVERSE_EFFECT_TYPE } from '@events';
import {
  getCurrentPhaseState,
  getNextMeleeReverseState,
  getOppositeFacing,
  getPositionOfUnit,
  getRangedAttackReverseState,
} from '@queries';

// TODO(misleading): the header says the new facing is the opposite of the
// current one, and that the event carries the unit's placement. A unit still
// engaged keeps its facing (§7.5.5), and the event carries the unit and its
// facing, not a placement. Settle by rewording the header and `@returns`.
/**
 * Generates a ResolveReverseEvent by calculating the new facing
 * (opposite of current facing) for a unit that is being reversed.
 *
 * @param state - The current game state
 * @returns A complete ResolveReverseEvent with the reversed unit placement
 * @throws Error if not in a valid state for reverse resolution
 */
export function generateResolveReverseEvent(
  state: GameState,
): ResolveReverseEvent {
  // Only an attack's results reverse a unit (§9.2), so the reverse is in a
  // shot (issueCommands) or a melee (resolveMelee) and nowhere else.
  const phaseState = getCurrentPhaseState(state);

  // TODO(composition): the phase picks between a scoped getter for the shot
  // and a selection for the melee. Retreats and routs are found by one
  // selection across contexts (`findRetreatAwaitingMove`,
  // `findRoutAwaitingPenalty`). Settled by a `findReverseAwaitingTurn`
  // selection in `@queries`, or by deciding the split is worth keeping.
  let reverseState: ReverseState;

  if (phaseState.phase === 'issueCommands') {
    // A shot has one target, and so one reverse.
    reverseState = getRangedAttackReverseState(state);
  } else if (phaseState.phase === 'resolveMelee') {
    // In a melee the second player's unit turns first, since the first
    // player's blow lands first (§7.5.6).
    reverseState = getNextMeleeReverseState(state);
  } else {
    // No other phase carries out an attack's results.
    throw new Error(
      `Reverse resolution not expected in phase: ${phaseState.phase}`,
    );
  }

  // A reverse can come due after a retreat has already moved the unit, so the
  // square it turns on is read off the board rather than taken from the substep.
  const placement = getPositionOfUnit(state, reverseState.reversingUnit);
  // A unit still locked with an opponent holds its facing: the reverse is
  // reached and resolved, and it turns nobody. The facing on the event is the
  // record of which happened.
  const canTurn = canReverseUnit(reverseState, state);
  const newFacing = canTurn
    ? getOppositeFacing(placement.facing)
    : placement.facing;

  const event: ResolveReverseEvent = {
    effectType: RESOLVE_REVERSE_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
    facing: newFacing,
    unit: reverseState.reversingUnit,
  };

  // The unit, by the reverse's own copy of it, and the way it faces once the
  // reverse is resolved: turned 180° where it stands (§9.2.1), or unchanged.
  return event;
}
