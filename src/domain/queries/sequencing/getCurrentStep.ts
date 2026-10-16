import type { GameState } from '@game';
import { getCurrentPhaseState } from './getPhaseState';

/**
 * Gets the current step from the phase state.
 * Every phase slice has a step. Throws when the round has not entered a phase.
 *
 * @param state - The game state
 * @returns The current step
 * @throws Error if phase state is missing
 */
export function getCurrentStep(state: GameState): string {
  const phaseState = getCurrentPhaseState(state);
  const step = phaseState.step;
  return step;
}
