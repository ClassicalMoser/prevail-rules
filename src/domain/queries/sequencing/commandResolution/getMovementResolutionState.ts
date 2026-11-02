import type { GameState, MovementResolutionState } from '@game';
import { getCurrentCommandResolutionState } from './getCurrentCommandResolutionState';

/**
 * Gets the movement resolution state from the issue commands phase.
 * Assumes we're resolving a movement (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The movement resolution state
 * @throws Error if not resolving a movement
 */
export function getMovementResolutionState<S extends GameState>(
  state: S,
): MovementResolutionState {
  const commandResolutionState = getCurrentCommandResolutionState(state);
  if (commandResolutionState.commandResolutionType !== 'movement') {
    throw new Error('Current command resolution is not a movement');
  }
  return commandResolutionState;
}
