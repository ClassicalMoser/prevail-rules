import type {
  CommandResolutionState,
  GameState,
  IssueCommandsPhaseState,
} from '@game';
import { getIssueCommandsPhaseState } from '@queries';
import { isPending } from '@utils';
import { updatePhaseState } from '../state';

/**
 * Creates a new game state with the command resolution state updated in the issue commands phase.
 * Uses queries internally to navigate to the command resolution state.
 *
 * @param state - The current game state
 * @param commandResolutionState - The new command resolution state to set
 * @returns A new game state with the updated command resolution state
 *
 * @example
 * ```ts
 * const newState = updateCommandResolutionState(state, {
 *   ...getCurrentCommandResolutionState(state),
 *   completed: true,
 * });
 * ```
 */
export function updateCommandResolutionState<S extends GameState>(
  state: S,
  commandResolutionState: CommandResolutionState,
): S {
  // Orders are only carried out in Phase 3; asked elsewhere, this throws.
  const issueCommandsPhaseState = getIssueCommandsPhaseState(state);

  // This writer carries a unit's move or shot forward, so one must already
  // be under way; starting one is `openCommandResolution`'s.
  if (isPending(issueCommandsPhaseState.currentCommandResolutionState)) {
    throw new Error('No current command resolution state found');
  }

  // The unit's move or shot, as it now stands, in place of the one before.
  const newPhaseState: IssueCommandsPhaseState = {
    ...issueCommandsPhaseState,
    currentCommandResolutionState: commandResolutionState,
  };
  const updated = updatePhaseState(state, newPhaseState);

  // Phase 3 with that unit's move or shot written.
  return updated;
}
