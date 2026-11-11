import type { TriggerRoutFromRetreatEvent } from '@events';
import type { GameState } from '@game';
import { createOpenedRoutState } from '@factories';
import { getAttackApplyStateOfPlayer, getRetreatAwaitingRout } from '@queries';
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
 * The event carries nothing: the retreat waiting for its rout is the state's to name.
 *
 * @param _event - Present for `applyGameEffectEvent` dispatch; this effect has no payload fields
 * @param state - The current game state
 * @returns A new game state with the rout state created in the retreat state
 */
export function applyTriggerRoutFromRetreatEvent<S extends GameState>(
  _event: TriggerRoutFromRetreatEvent,
  state: S,
): S {
  const { retreatState } = getRetreatAwaitingRout(state);
  const retreatingPlayer = retreatState.retreatingUnit.unit.playerSide;

  const routState = createOpenedRoutState(retreatingPlayer, [
    retreatState.retreatingUnit.unit,
  ]);

  const withNestedRout = updateRetreatRoutState(state, routState);

  // The retreat stays open (it holds this nested rout). Reverse on the apply
  // cannot still be due once the unit is routing off the board.
  const apply = getAttackApplyStateOfPlayer(withNestedRout, retreatingPlayer);
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
