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
  // The order being carried out; asking outside one throws there.
  const commandResolutionState = getCurrentCommandResolutionState(state);

  // A caller that reads a move during a Shoot has asked out of turn.
  if (commandResolutionState.commandResolutionType !== 'movement') {
    throw new Error('Current command resolution is not a movement');
  }

  // The Move being carried out.
  return commandResolutionState;
}
