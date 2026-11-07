import type { AttackApplyState, GameState } from '@game';
import { throwIfPending } from '@utils';
import { getRangedAttackResolutionState } from '@queries/sequencing/commandResolution/getRangedAttackResolutionState';

/**
 * Gets the attack apply state from a ranged attack resolution.
 * Assumes we're resolving a ranged attack with an attack apply state
 * (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The attack apply state
 * @throws Error if not resolving a ranged attack or attack apply state is missing
 */
export function getRangedAttackApplyState(state: GameState): AttackApplyState {
  const rangedAttackState = getRangedAttackResolutionState(state);
  const attackApplyState = throwIfPending(
    rangedAttackState.attackApplyState,
    'No attack apply state found in ranged attack resolution',
  );
  return attackApplyState;
}
