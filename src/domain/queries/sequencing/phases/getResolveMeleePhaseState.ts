import type { GameState, ResolveMeleePhaseState } from '@game';
import { getCurrentPhaseState } from './getCurrentPhaseState';

/**
 * Gets the resolve melee phase state from the game state.
 * Throws when the current phase is anything else.
 *
 * @param state - The game state
 * @returns The resolve melee phase state
 * @throws Error if not in resolveMelee phase or phase state is missing
 */
export function getResolveMeleePhaseState<S extends GameState>(
  state: S,
): ResolveMeleePhaseState {
  const phaseState = getCurrentPhaseState(state);
  if (phaseState.phase !== 'resolveMelee') {
    throw new Error(`Expected resolveMelee phase, got ${phaseState.phase}`);
  }
  return phaseState;
}
