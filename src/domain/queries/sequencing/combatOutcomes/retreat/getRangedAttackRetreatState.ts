import type { GameState, RetreatState } from '@game';
import { throwIfBypassed } from '@utils';
import { getRangedAttackApplyState } from '../attackApply/getRangedAttackApplyState';
import { getRetreatStateFromAttackApply } from './getRetreatStateFromAttackApply';

/**
 * Gets the retreat state from a ranged attack resolution.
 * Navigates: RangedAttackResolutionState -> AttackApplyState -> RetreatState
 *
 * @param state - The game state
 * @returns The retreat state
 * @throws Error when there is no ranged attack apply, or when the attack
 * applied no retreat to it
 */
export function getRangedAttackRetreatState(state: GameState): RetreatState {
  const attackApplyState = getRangedAttackApplyState(state);
  // An attack that applied no retreat answers `'bypassed'`. That is a fact
  // about the attack, not a retreat this getter can hand back.
  const retreatState = throwIfBypassed(
    getRetreatStateFromAttackApply(attackApplyState),
    'The ranged attack applied no retreat',
  );
  return retreatState;
}
