import type { AttackApplyState, GameState, ReverseState } from '@game';
import { throwIfPending } from '@utils';
import { getMeleeResolutionState } from '../getCommandResolutionState';

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

  if (
    firstPlayerAttackApply !== 'pending' &&
    firstPlayerAttackApply.reverseState !== 'pending' &&
    firstPlayerAttackApply.reverseState.finalPosition === 'pending'
  ) {
    return firstPlayerAttackApply.reverseState;
  }
  if (
    secondPlayerAttackApply !== 'pending' &&
    secondPlayerAttackApply.reverseState !== 'pending' &&
    secondPlayerAttackApply.reverseState.finalPosition === 'pending'
  ) {
    return secondPlayerAttackApply.reverseState;
  }
  throw new Error('No reverse state found in melee resolution');
}
