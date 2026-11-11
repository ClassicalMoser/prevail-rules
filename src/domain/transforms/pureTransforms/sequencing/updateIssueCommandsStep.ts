import type { GameState, IssueCommandsPhaseStep } from '@game';
import { getIssueCommandsPhaseState } from '@queries';
import { updatePhaseState } from '../state/updatePhaseState';

/**
 * Moves issue commands to a step.
 *
 * @param state - The game state, in issue commands
 * @param step - The step to move to
 * @returns The game state on that step
 */
export function updateIssueCommandsStep<S extends GameState>(
  state: S,
  step: IssueCommandsPhaseStep,
): S {
  const phaseState = getIssueCommandsPhaseState(state);
  const updated = updatePhaseState(state, { ...phaseState, step });
  return updated;
}
