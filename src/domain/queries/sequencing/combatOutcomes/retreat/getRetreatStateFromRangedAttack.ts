import type { GameState, RetreatState } from '@game';
import { getAttackApplyStateFromRangedAttack } from '../attackApply/getAttackApplyStateFromRangedAttack';
import { getRetreatStateFromAttackApply } from './getRetreatStateFromAttackApply';

/**
 * Gets the retreat state from a ranged attack resolution.
 * Navigates: RangedAttackResolutionState -> AttackApplyState -> RetreatState
 *
 * @param state - The game state
 * @returns The retreat state
 * @throws Error if any step in the navigation is missing
 */
export function getRetreatStateFromRangedAttack(
  state: GameState,
): RetreatState {
  const attackApplyState = getAttackApplyStateFromRangedAttack(state);
  const retreatState = getRetreatStateFromAttackApply(attackApplyState);
  return retreatState;
}
