import type { UnitWithPlacement } from '@entities';
import type { ResolveReverseEvent } from '@events';
import type { GameState, ReverseState } from '@game';
import { canReverseUnit } from '@legality';
import {
  GAME_EFFECT_EVENT_TYPE,
  MELEE_ATTACK_RESOLUTION_CONTEXT,
  RANGED_ATTACK_RESOLUTION_CONTEXT,
  RESOLVE_REVERSE_EFFECT_TYPE,
} from '@events';
import { throwIfBypassed } from '@utils';
import {
  getAttackApplyStateFromRangedAttack,
  getCurrentPhaseState,
  getOppositeFacing,
  getPositionOfUnit,
  getReverseStateFromAttackApply,
  getReverseStateFromMeleeResolutionByInitiative,
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
  eventNumber: number,
): ResolveReverseEvent {
  const phaseState = getCurrentPhaseState(state);

  let reverseState: ReverseState;

  if (phaseState.phase === 'issueCommands') {
    reverseState = throwIfBypassed(
      getReverseStateFromAttackApply(
        getAttackApplyStateFromRangedAttack(state),
      ),
      'The ranged attack applied no reverse to resolve',
    );
  } else if (phaseState.phase === 'resolveMelee') {
    reverseState = getReverseStateFromMeleeResolutionByInitiative(state);
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

  // The event records where the unit stood when it turned.
  const reversingUnit: UnitWithPlacement = {
    placement,
    unit: reverseState.reversingUnit,
  };

  const attackResolutionContext =
    phaseState.phase === 'issueCommands'
      ? RANGED_ATTACK_RESOLUTION_CONTEXT
      : MELEE_ATTACK_RESOLUTION_CONTEXT;

  return {
    attackResolutionContext,
    effectType: RESOLVE_REVERSE_EFFECT_TYPE,
    eventNumber,
    eventType: GAME_EFFECT_EVENT_TYPE,
    newUnitPlacement: {
      placement: {
        coordinate: placement.coordinate,
        facing: newFacing,
      },
      unit: reverseState.reversingUnit,
    },
    unitInstance: reversingUnit,
  };
}
