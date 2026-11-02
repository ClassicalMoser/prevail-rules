import type { GameState, RangedAttackResolutionState } from '@game';
import { getCurrentCommandResolutionState } from './getCurrentCommandResolutionState';

/**
 * Gets the ranged attack resolution state from the issue commands phase.
 * Assumes we're resolving a ranged attack (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The ranged attack resolution state
 * @throws Error if not resolving a ranged attack
 */
export function getRangedAttackResolutionState(
  state: GameState,
): RangedAttackResolutionState {
  const commandResolutionState = getCurrentCommandResolutionState(state);
  if (commandResolutionState.commandResolutionType !== 'rangedAttack') {
    throw new Error('Current command resolution is not a ranged attack');
  }
  return commandResolutionState;
}
