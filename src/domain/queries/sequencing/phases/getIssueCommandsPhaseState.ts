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
  // The phase the round is in; before the round begins there is none.
  const phaseState = getCurrentPhaseState(state);

  // A caller reading Phase 3, where each player issues and carries out their orders (§4.3) outside it has asked out of turn.
  if (phaseState.phase !== 'issueCommands') {
    throw new Error(`Expected issueCommands phase, got ${phaseState.phase}`);
  }

  // The issue commands phase, with its step and what it holds.
  return phaseState;
}
