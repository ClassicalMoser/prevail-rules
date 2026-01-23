import type { AttackApplyState, Board, GameState } from '@entities';
import {
  getMeleeResolutionState,
  getRangedAttackResolutionState,
} from '../getCommandResolutionState';

/**
 * Gets the attack apply state from a ranged attack resolution.
 * Assumes we're resolving a ranged attack with an attack apply state
 * (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The attack apply state
 * @throws Error if not resolving a ranged attack or attack apply state is missing
 */
export function getAttackApplyStateFromRangedAttack<TBoard extends Board>(
  state: GameState<TBoard>,
): AttackApplyState<TBoard> {
  const rangedAttackState = getRangedAttackResolutionState(state);
  if (!rangedAttackState.attackApplyState) {
    throw new Error('No attack apply state found in ranged attack resolution');
  }
  return rangedAttackState.attackApplyState;
}

/**
 * Gets the attack apply state from melee resolution for a specific player.
 * Assumes we're in resolveMelee phase with a melee resolution state
 * (validation should happen elsewhere).
 *
 * @param state - The game state
 * @param player - The player ('white' or 'black')
 * @returns The attack apply state for the player
 * @throws Error if not in resolveMelee phase or attack apply state is missing
 */
export function getAttackApplyStateFromMelee<TBoard extends Board>(
  state: GameState<TBoard>,
  player: 'white' | 'black',
): AttackApplyState<TBoard> {
  const meleeState = getMeleeResolutionState(state);
  const attackApplyState =
    player === 'white'
      ? meleeState.whiteAttackApplyState
      : meleeState.blackAttackApplyState;
  if (!attackApplyState) {
    throw new Error(
      `No ${player} attack apply state found in melee resolution`,
    );
  }
  return attackApplyState;
}
