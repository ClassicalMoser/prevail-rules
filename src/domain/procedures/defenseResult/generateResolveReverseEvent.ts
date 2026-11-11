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
  const phaseState = getCurrentPhaseState(state);

  let reverseState: ReverseState;

  if (phaseState.phase === 'issueCommands') {
    reverseState = getRangedAttackReverseState(state);
  } else if (phaseState.phase === 'resolveMelee') {
    reverseState = getNextMeleeReverseState(state);
  } else {
    throw new Error(
      `Reverse resolution not expected in phase: ${phaseState.phase}`,
    );
  }

  // A reverse can come due after a retreat has already moved the unit, so the
  // square it turns on is read off the board rather than taken from the substep.
  const placement = getPositionOfUnit(
    state.boardState,
    reverseState.reversingUnit,
  );
  // A unit still locked with an opponent holds its facing: the reverse is
  // reached and resolved, and it turns nobody. The facing on the event is the
  // record of which happened.
  const canTurn = canReverseUnit(reverseState, state);
  const newFacing = canTurn
    ? getOppositeFacing(placement.facing)
    : placement.facing;

  return {
    effectType: RESOLVE_REVERSE_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
    facing: newFacing,
    unit: reverseState.reversingUnit,
  };
}
