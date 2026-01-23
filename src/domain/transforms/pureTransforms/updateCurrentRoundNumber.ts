import type { Board, GameState } from '@entities';

/**
 * Creates a new game state with the current round number updated.
 *
 * @param state - The current game state
 * @param roundNumber - The new round number to set
 * @returns A new game state with the updated round number
 *
 * @example
 * ```ts
 * const newState = updateCurrentRoundNumber(state, state.currentRoundNumber + 1);
 * ```
 */
export function updateCurrentRoundNumber<TBoard extends Board>(
  state: GameState<TBoard>,
  roundNumber: number,
): GameState<TBoard> {
  return {
    ...state,
    currentRoundNumber: roundNumber,
  };
}
