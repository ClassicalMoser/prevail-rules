import type { GameState, RetreatState } from '@game';
import { getAttackApplyStateFromMelee } from '../attackApply/getAttackApplyStateFromMelee';
import { getRetreatStateFromAttackApply } from './getRetreatStateFromAttackApply';

/**
 * Gets the retreat state from melee resolution for a specific player.
 * Navigates: MeleeResolutionState -> AttackApplyState -> RetreatState
 *
 * @param state - The game state
 * @param player - The player ('white' or 'black')
 * @returns The retreat state
 * @throws Error if any step in the navigation is missing
 */
export function getRetreatStateFromMelee(
  state: GameState,
  player: 'white' | 'black',
): RetreatState {
  const attackApplyState = getAttackApplyStateFromMelee(state, player);
  const retreatState = getRetreatStateFromAttackApply(attackApplyState);
  return retreatState;
}
