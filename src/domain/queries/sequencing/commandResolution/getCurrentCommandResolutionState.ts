import type { CommandResolutionState, GameState, PhaseState } from '@game';
import { getCurrentPhaseState } from '../phases/getCurrentPhaseState';

/**
 * Gets the current command resolution state from the issue commands phase.
 * Assumes we're in issueCommands phase with a command resolution state (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The current command resolution state
 * @throws Error if not in issueCommands phase or command resolution state is missing
 */
export function getCurrentCommandResolutionState(
  state: GameState,
): CommandResolutionState {
  const phaseState: PhaseState = getCurrentPhaseState(state);
  // A movement or a ranged attack lives on this phase. Any other phase throws.
  if (phaseState.phase !== 'issueCommands') {
    throw new Error('Not in issueCommands phase');
  }
  const commandResolutionState = phaseState.currentCommandResolutionState;
  // `'pending'` means no command has opened yet.
  if (commandResolutionState === 'pending') {
    throw new Error('No current command resolution state');
  }
  return commandResolutionState;
}
