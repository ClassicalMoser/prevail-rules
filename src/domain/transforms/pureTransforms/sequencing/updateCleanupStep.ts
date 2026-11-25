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
  // Cleanup runs in a fixed order: cards leave play, then each player in
  // turn chooses whether to rally and carries it out (§4.5). Asked outside
  // cleanup, this throws.
  const phaseState = getCleanupPhaseState(state);

  // The step the caller has worked out comes next; the rallies already
  // written are kept.
  const updated = updatePhaseState(state, { ...phaseState, step });

  // Cleanup on that step.
  return updated;
}
