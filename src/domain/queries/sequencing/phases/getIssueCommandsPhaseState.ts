import type { GameState, IssueCommandsPhaseState } from '@game';
import { getCurrentPhaseState } from './getCurrentPhaseState';

/**
 * Gets the issue commands phase state from the game state.
 * Throws when the current phase is anything else.
 *
 * @param state - The game state
 * @returns The issue commands phase state
 * @throws Error if not in issueCommands phase or phase state is missing
 */
export function getIssueCommandsPhaseState<S extends GameState>(
  state: S,
): IssueCommandsPhaseState {
  const phaseState = getCurrentPhaseState(state);
  if (phaseState.phase !== 'issueCommands') {
    throw new Error(`Expected issueCommands phase, got ${phaseState.phase}`);
  }
  return phaseState;
}
