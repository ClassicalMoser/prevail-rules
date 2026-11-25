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
  // Phase 3 runs in four steps: the first player issues all their orders and
  // carries them out, then the second does the same (§4.3). Asked outside
  // Phase 3, this throws.
  const phaseState = getIssueCommandsPhaseState(state);

  // The step the caller has worked out comes next; the units still to act
  // and any move or shot under way are kept.
  const updated = updatePhaseState(state, { ...phaseState, step });

  // Phase 3 on that step.
  return updated;
}
