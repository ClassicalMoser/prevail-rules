import type { UnitPlacement } from '@entities';
import type { OpenRetreatFromAttackApplyEvent } from '@events';
import type { GameState, RetreatState } from '@game';
import { RANGED_ATTACK_RESOLUTION_CONTEXT } from '@events';
import { getLegalRetreats } from '@legality';
import {
  getAttackApplyStateFromMelee,
  getAttackApplyStateFromRangedAttack,
  getPositionOfUnit,
} from '@queries';
import { updateAttackApplyState } from '@transforms/pureTransforms';

/**
 * Opens the retreat substep on an attack apply whose retreat slot is still
 * pending.
 *
 * The attack already measured a retreat; this writes the substep when that
 * step's turn comes, computing legal options from the board at that moment.
 *
 * @param event - Resolution context from the procedure (trusted log payload)
 * @param state - The current game state
 * @returns A new game state with the retreat written on the named attack apply
 */
export function applyOpenRetreatFromAttackApplyEvent<S extends GameState>(
  event: OpenRetreatFromAttackApplyEvent,
  state: S,
): S {
  const apply =
    event.attackResolutionContext === RANGED_ATTACK_RESOLUTION_CONTEXT
      ? getAttackApplyStateFromRangedAttack(state)
      : getAttackApplyStateFromMelee(state, event.defendingPlayer);

  // A retreat opens only from a pending slot — already open or bypassed is wrong.
  if (apply.retreatState !== 'pending') {
    throw new Error('Retreat is not pending on this attack apply');
  }

  // The unit's square is read from the board now, in case a prior step moved it.
  const placement = getPositionOfUnit(state.boardState, apply.defendingUnit);
  const retreatingUnit = {
    placement,
    unit: apply.defendingUnit,
  };
  const legalRetreatOptions: UnitPlacement[] = [
    ...getLegalRetreats(retreatingUnit, state),
  ];
  // One legal answer is not a choice — auto-fill the destination.
  const finalPosition: UnitPlacement | 'pending' =
    legalRetreatOptions.length === 1 ? legalRetreatOptions[0] : 'pending';

  // A retreat with somewhere to go will never rout, so that slot is bypassed.
  // Nowhere to go leaves the rout pending until triggerRoutFromRetreat opens it.
  const nestedRoutState: 'pending' | 'bypassed' =
    legalRetreatOptions.length === 0 ? 'pending' : 'bypassed';

  const retreatState: RetreatState = {
    completed: false,
    finalPosition,
    legalRetreatOptions,
    retreatingUnit,
    routState: nestedRoutState,
    substepType: 'retreat',
  };

  const nextApply = {
    ...apply,
    retreatState,
  };
  return updateAttackApplyState(state, nextApply);
}
