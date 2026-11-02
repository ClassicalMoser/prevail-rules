import type { GameState, MoveCommandersPhaseState } from '@game';
import { getCurrentPhaseState } from './getCurrentPhaseState';

/**
 * Gets the move commanders phase state from the game state.
 * Throws when the current phase is anything else.
 *
 * @param state - The game state
 * @returns The move commanders phase state
 * @throws Error if not in moveCommanders phase or phase state is missing
 */
export function getMoveCommandersPhaseState<S extends GameState>(
  state: S,
): MoveCommandersPhaseState {
  const phaseState = getCurrentPhaseState(state);
  if (phaseState.phase !== 'moveCommanders') {
    throw new Error(`Expected moveCommanders phase, got ${phaseState.phase}`);
  }
  return phaseState;
}
