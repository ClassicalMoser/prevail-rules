import type { CleanupPhaseState, GameState } from '@game';
import { getCurrentPhaseState } from './getCurrentPhaseState';

/**
 * Gets the cleanup phase state from the game state.
 * Throws when the current phase is anything else.
 *
 * @param state - The game state
 * @returns The cleanup phase state
 * @throws Error if not in cleanup phase or phase state is missing
 */
export function getCleanupPhaseState<S extends GameState>(
  state: S,
): CleanupPhaseState {
  const phaseState = getCurrentPhaseState(state);
  if (phaseState.phase !== 'cleanup') {
    throw new Error(`Expected cleanup phase, got ${phaseState.phase}`);
  }
  return phaseState;
}
