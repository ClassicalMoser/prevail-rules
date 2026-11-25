import type { GameState, PhaseState } from '@game';
import { throwIfNone } from '@utils';

/**
 * Gets the current phase state from the game state.
 * Throws when the round has not entered a phase (`'none'`).
 *
 * @param state - The game state
 * @returns The current phase state
 * @throws Error if phase state is missing
 */
export function getCurrentPhaseState<S extends GameState>(
  state: S,
): PhaseState {
  // A round passes through five phases in order (§4); before the first has
  // begun, the round holds `'none'`, and nothing is there to read.
  const current = state.currentRoundState.currentPhaseState;
  const phaseState = throwIfNone(current, 'No current phase state found');

  // The phase the round is in.
  return phaseState;
}
