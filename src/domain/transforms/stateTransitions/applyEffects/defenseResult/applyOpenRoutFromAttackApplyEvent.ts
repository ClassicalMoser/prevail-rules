import type { OpenRoutFromAttackApplyEvent } from '@events';
import type { GameState, RoutState } from '@game';
import { RANGED_ATTACK_RESOLUTION_CONTEXT } from '@events';
import {
  getAttackApplyStateFromMelee,
  getAttackApplyStateFromRangedAttack,
} from '@queries';
import {
  removeUnitsLeavingUnderRout,
  updateAttackApplyState,
} from '@transforms/pureTransforms';

/**
 * Opens the rout substep on an attack apply whose rout slot is still pending.
 *
 * The attack already measured a rout; this writes the substep when that step's
 * turn comes. A rout supersedes retreat and reverse — the unit leaves the board
 * — so those sibling slots are written `'bypassed'` even if their thresholds fell.
 *
 * @param event - Resolution context from the procedure (trusted log payload)
 * @param state - The current game state
 * @returns A new game state with the rout written on the named attack apply
 */
export function applyOpenRoutFromAttackApplyEvent<S extends GameState>(
  event: OpenRoutFromAttackApplyEvent,
  state: S,
): S {
  const apply =
    event.attackResolutionContext === RANGED_ATTACK_RESOLUTION_CONTEXT
      ? getAttackApplyStateFromRangedAttack(state)
      : getAttackApplyStateFromMelee(state, event.defendingPlayer);

  // A rout opens only from a pending slot — already open or bypassed is wrong.
  if (apply.routState !== 'pending') {
    throw new Error('Rout is not pending on this attack apply');
  }

  // The defender leaves under rout; discard count is filled by resolveRout.
  const routState: RoutState = {
    cardsChosen: false,
    completed: false,
    numberToDiscard: 'pending',
    player: apply.defendingUnit.playerSide,
    substepType: 'rout',
    unitsToRout: [apply.defendingUnit],
  };

  // A rout supersedes: retreat and reverse do not happen to a unit that leaves.
  const nextApply = {
    ...apply,
    retreatState: 'bypassed' as const,
    reverseState: 'bypassed' as const,
    routState,
  };
  const withRoutOpen = updateAttackApplyState(state, nextApply);
  // The unit leaves when the rout opens, not when the discard is paid.
  return removeUnitsLeavingUnderRout(withRoutOpen, routState.unitsToRout);
}
