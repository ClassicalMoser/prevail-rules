import type { AttackApplyState, GameState, ReverseState } from '@game';
import { isOpenSubstep, throwIfPending } from '@utils';
import { getMeleeResolutionState } from '../meleeResolution/getMeleeResolutionState';

/**
 * Gets the reverse state from an attack apply state.
 * Assumes the attack apply state has a reverse state (validation should happen elsewhere).
 *
 * @param attackApplyState - The attack apply state
 * @returns The reverse state
 * @throws Error if reverse state is missing
 */
export function getReverseStateFromAttackApply(
  attackApplyState: AttackApplyState,
): ReverseState {
  return throwIfPending(
    attackApplyState.reverseState,
    'No reverse state found in attack apply state',
  );
}

/**
 * Active reverse substep from melee resolution (initiative order), when still awaiting facing resolution.
 */
export function getReverseStateFromMeleeResolutionByInitiative(
  state: GameState,
): ReverseState {
  const meleeState = getMeleeResolutionState(state);
  const firstPlayer = state.currentInitiative;
  const firstPlayerAttackApply =
    firstPlayer === 'white'
      ? meleeState.whiteAttackApplyState
      : meleeState.blackAttackApplyState;
  const secondPlayerAttackApply =
    firstPlayer === 'white'
      ? meleeState.blackAttackApplyState
      : meleeState.whiteAttackApplyState;

  // A miss apply has reverseState 'miss'. That side has nothing to reverse.
  if (firstPlayerAttackApply !== 'pending') {
    const firstReverse = firstPlayerAttackApply.reverseState;
    if (isOpenSubstep(firstReverse) && firstReverse.finalPosition === 'pending') {
      return firstReverse;
    }
  }
  if (secondPlayerAttackApply !== 'pending') {
    const secondReverse = secondPlayerAttackApply.reverseState;
    if (
      isOpenSubstep(secondReverse) &&
      secondReverse.finalPosition === 'pending'
    ) {
      return secondReverse;
    }
  }
  throw new Error('No reverse state found in melee resolution');
}
