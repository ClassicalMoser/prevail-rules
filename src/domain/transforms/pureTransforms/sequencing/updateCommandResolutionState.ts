import type {
  Board,
  CommandResolutionState,
  GameState,
  IssueCommandsPhaseState,
} from '@entities';
import { getIssueCommandsPhaseState } from '@queries';
import { updatePhaseState } from '../state/updatePhaseState';

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
export function updateCommandResolutionState<TBoard extends Board>(
  state: GameState<TBoard>,
  commandResolutionState: CommandResolutionState<TBoard>,
): GameState<TBoard> {
  const issueCommandsPhaseState = getIssueCommandsPhaseState(state);

  if (!issueCommandsPhaseState.currentCommandResolutionState) {
    throw new Error('No current command resolution state found');
  }

  const newPhaseState: IssueCommandsPhaseState<TBoard> = {
    ...issueCommandsPhaseState,
    currentCommandResolutionState: commandResolutionState,
  };

  return updatePhaseState(state, newPhaseState);
}
