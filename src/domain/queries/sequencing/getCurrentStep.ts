import type { GameState } from '@game';
import { getCurrentPhaseState } from './phases/getCurrentPhaseState';

/**
 * Gets the current step from the phase state.
 * Every phase slice has a step. Throws when the round has not entered a phase.
 *
 * @param state - The game state
 * @returns The current step
 * @throws Error if phase state is missing
 */
export function getCurrentStep(state: GameState): string {
  // The phase the round is in; before the round begins there is none.
  const phaseState = getCurrentPhaseState(state);

  // Within it, where play stands: whose turn it is, and at what point.
  const step = phaseState.step;

  // The step, for a caller that does not need to know which phase holds it.
  return step;
}
