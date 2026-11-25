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
  // The phase the round is in; before the round begins there is none.
  const phaseState = getCurrentPhaseState(state);

  // A caller reading Phase 2, where each player may move their commander (§4.2) outside it has asked out of turn.
  if (phaseState.phase !== 'moveCommanders') {
    throw new Error(`Expected moveCommanders phase, got ${phaseState.phase}`);
  }

  // The move commanders phase, with its step and what it holds.
  return phaseState;
}
