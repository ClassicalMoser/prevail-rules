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
 * The rout takes the place of the retreat the unit could not make (§7.5.6), and
 * the unit leaves the board now. So nothing later in the order can happen to
 * it: a reverse still due on the apply is bypassed, and so is a rout the attack
 * reached too, which this rout has already carried out.
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
  // The retreat with nowhere to go (§9.1.5): its unit must retreat and
  // cannot, so it routs instead (§9.1.6). In a melee that is the unit whose
  // retreat comes first in the order (§7.5.6).
  const { retreatState } = getRetreatAwaitingRout(state);
  const retreatingPlayer = retreatState.retreatingUnit.playerSide;

  // The unit routs, and its owner pays its Morale (§9.3.2). The retreat's own
  // copy of the unit is the one that leaves.
  const routState = createOpenedRoutState(retreatingPlayer, [
    retreatState.retreatingUnit,
  ]);

  // The rout is written inside the retreat it replaces.
  const withNestedRout = updateRetreatRoutState(state, routState);

  // The retreat stays open (it holds this nested rout). A unit routing off the
  // board now cannot still be due to turn about, or to rout a second time.
  const apply = getAttackApplyStateOfPlayer(withNestedRout, retreatingPlayer);
  const nextApply = {
    ...apply,
    reverseState: 'bypassed' as const,
    routState: 'bypassed' as const,
  };
  const withLaterStagesBypassed = updateAttackApplyState(
    withNestedRout,
    nextApply,
  );

  // The unit leaves when the rout opens, not when the discard is paid.
  // It routs in combat, so its own commander standing with it falls too
  // (§4.2.8).
  const routed = removeUnitsLeavingUnderRout(
    withLaterStagesBypassed,
    routState.unitsToRout,
  );

  // The game with the unit gone and its Morale still to be counted.
  return routed;
}
