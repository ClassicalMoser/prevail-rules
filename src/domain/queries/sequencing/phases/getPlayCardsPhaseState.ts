import type { GameState, PlayCardsPhaseState } from '@game';
import { getCurrentPhaseState } from './getCurrentPhaseState';

/**
 * Gets the play cards phase state from the game state.
 * Throws when the current phase is anything else.
 *
 * @param state - The game state
 * @returns The play cards phase state
 * @throws Error if not in playCards phase or phase state is missing
 */
export function getPlayCardsPhaseState<S extends GameState>(
  state: S,
): PlayCardsPhaseState {
  const phaseState = getCurrentPhaseState(state);
  if (phaseState.phase !== 'playCards') {
    throw new Error(`Expected playCards phase, got ${phaseState.phase}`);
  }
  return phaseState;
}
