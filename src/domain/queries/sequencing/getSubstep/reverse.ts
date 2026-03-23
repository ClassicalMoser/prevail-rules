import type {
  AttackApplyState,
  Board,
  GameState,
  ReverseState,
} from '@entities';
import { getMeleeResolutionState } from '../getCommandResolutionState';

/**
 * Gets the reverse state from an attack apply state.
 * Assumes the attack apply state has a reverse state (validation should happen elsewhere).
 *
 * @param attackApplyState - The attack apply state
 * @returns The reverse state
 * @throws Error if reverse state is missing
 */
export function getReverseStateFromAttackApply<TBoard extends Board>(
  attackApplyState: AttackApplyState<TBoard>,
): ReverseState<TBoard> {
  if (!attackApplyState.reverseState) {
    throw new Error('No reverse state found in attack apply state');
  }
  return attackApplyState.reverseState;
}

/**
 * Active reverse substep from melee resolution (initiative order), when still awaiting facing resolution.
 */
export function getReverseStateFromMeleeResolutionByInitiative<
  TBoard extends Board,
>(state: GameState<TBoard>): ReverseState<TBoard> {
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
    firstPlayerAttackApply?.reverseState &&
    firstPlayerAttackApply.reverseState.finalPosition === undefined
  ) {
    return firstPlayerAttackApply.reverseState;
  }
  if (
    secondPlayerAttackApply?.reverseState &&
    secondPlayerAttackApply.reverseState.finalPosition === undefined
  ) {
    return secondPlayerAttackApply.reverseState;
  }
  throw new Error('No reverse state found in melee resolution');
}
