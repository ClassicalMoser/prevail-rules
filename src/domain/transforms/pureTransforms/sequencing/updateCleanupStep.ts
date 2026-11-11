import type { CleanupPhaseStep, GameState } from '@game';
import { getCleanupPhaseState } from '@queries';
import { updatePhaseState } from '../state/updatePhaseState';

/**
 * Moves cleanup to a step.
 *
 * @param state - The game state, in cleanup
 * @param step - The step to move to
 * @returns The game state on that step
 * @throws Error when the game is not in cleanup
 */
export function updateCleanupStep<S extends GameState>(
  state: S,
  step: CleanupPhaseStep,
): S {
  const phaseState = getCleanupPhaseState(state);
  const updated = updatePhaseState(state, { ...phaseState, step });
  return updated;
}
