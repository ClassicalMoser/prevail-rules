import type { TriggerRoutFromRetreatEvent } from '@events';
import type { GameState } from '@game';
import { createOpenedRoutState } from '@factories';
import { RANGED_ATTACK_RESOLUTION_CONTEXT } from '@events';
import {
  getMeleeAttackApplyState,
  getRangedAttackApplyState,
  getMeleeRetreatState,
  getRangedAttackRetreatState,
} from '@queries';
import {
  removeUnitsLeavingUnderRout,
  updateAttackApplyState,
  updateRetreatRoutState,
} from '@transforms/pureTransforms';

/**
 * Applies a TriggerRoutFromRetreatEvent to the game state.
 * Creates a rout state in the retreat state when there are no legal retreat options.
 * A rout supersedes reverse on the parent attack apply, so that slot is bypassed —
 * a unit that leaves cannot still be due to reverse.
 *
 * @param event - Resolution context from the procedure (trusted log payload)
 * @param state - The current game state
 * @returns A new game state with the rout state created in the retreat state
 */
export function applyTriggerRoutFromRetreatEvent<S extends GameState>(
  event: TriggerRoutFromRetreatEvent,
  state: S,
): S {
  const retreatState =
    event.retreatResolutionContext === RANGED_ATTACK_RESOLUTION_CONTEXT
      ? getRangedAttackRetreatState(state)
      : getMeleeRetreatState(state, event.retreatingPlayer);

  const routState = createOpenedRoutState(
    retreatState.retreatingUnit.unit.playerSide,
    [retreatState.retreatingUnit.unit],
  );

  const withNestedRout = updateRetreatRoutState(state, routState);

  // The retreat stays open (it holds this nested rout). Reverse on the apply
  // cannot still be due once the unit is routing off the board.
  const apply =
    event.retreatResolutionContext === RANGED_ATTACK_RESOLUTION_CONTEXT
      ? getRangedAttackApplyState(withNestedRout)
      : getMeleeAttackApplyState(withNestedRout, event.retreatingPlayer);

  const nextApply = {
    ...apply,
    reverseState: 'bypassed' as const,
  };
  const withReverseBypassed = updateAttackApplyState(withNestedRout, nextApply);
  // The unit leaves when the rout opens, not when the discard is paid.
  return removeUnitsLeavingUnderRout(
    withReverseBypassed,
    routState.unitsToRout,
  );
}
