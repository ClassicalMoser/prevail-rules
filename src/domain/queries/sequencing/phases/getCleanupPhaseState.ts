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
  // The phase the round is in; before the round begins there is none.
  const phaseState = getCurrentPhaseState(state);

  // A caller reading Phase 5, where cards leave play and each player may rally (§4.5) outside it has asked out of turn.
  if (phaseState.phase !== 'cleanup') {
    throw new Error(`Expected cleanup phase, got ${phaseState.phase}`);
  }

  // The cleanup phase, with its step and what it holds.
  return phaseState;
}
