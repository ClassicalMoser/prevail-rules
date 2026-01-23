import type { Board, GameState, ResolveMeleePhaseState } from '@entities';
import type { CompleteMeleeResolutionEvent } from '@events';
import { getResolveMeleePhaseState } from '@queries';

/**
 * Applies a CompleteMeleeResolutionEvent to the game state.
 * Clears the currentMeleeResolutionState and allows the phase to continue
 * to the next engagement or complete.
 *
 * @param event - The complete melee resolution event to apply
 * @param state - The current game state
 * @returns A new game state with the melee resolution state cleared
 */
export function applyCompleteMeleeResolutionEvent<TBoard extends Board>(
  event: CompleteMeleeResolutionEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = getResolveMeleePhaseState(state);

  // Clear the current melee resolution state
  const newPhaseState: ResolveMeleePhaseState<TBoard> = {
    ...phaseState,
    currentMeleeResolutionState: undefined,
  };

  return {
    ...state,
    currentRoundState: {
      ...state.currentRoundState,
      currentPhaseState: newPhaseState,
    },
  };
}
