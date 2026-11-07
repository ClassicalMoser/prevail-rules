import type { GameState, ReverseState } from '@game';
import { throwIfBypassed } from '@utils';
import { getRangedAttackApplyState } from '../attackApply/getRangedAttackApplyState';
import { getReverseStateFromAttackApply } from './getReverseStateFromAttackApply';

/**
 * The reverse on the ranged attack apply.
 *
 * Descends RangedAttackResolutionState -> AttackApplyState -> ReverseState.
 *
 * @param state - The game state
 * @returns The reverse substep
 * @throws Error when there is no ranged attack apply, or when
 * the attack applied no reverse to it
 */
export function getRangedAttackReverseState(state: GameState): ReverseState {
  const attackApplyState = getRangedAttackApplyState(state);
  // An attack that applied no reverse answers `'bypassed'`. That is a fact about
  // the attack, not a reverse this getter can hand back.
  const reverseState = throwIfBypassed(
    getReverseStateFromAttackApply(attackApplyState),
    'The ranged attack applied no reverse',
  );
  return reverseState;
}
