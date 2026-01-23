import type { Board, GameState } from '@entities';

/**
 * Gets the current step from the phase state.
 * Assumes we're in a phase with steps (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The current step
 * @throws Error if phase state is missing
 */
export function getCurrentStep<TBoard extends Board>(
  state: GameState<TBoard>,
): string {
  const phaseState = state.currentRoundState.currentPhaseState;
  if (!phaseState) {
    throw new Error('No current phase state found');
  }
  // All phase states have a step property
  return phaseState.step;
}
