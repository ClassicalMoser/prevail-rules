import type { Board, GameState, RoundState } from '@entities';

/**
 * Creates a new game state with the round state updated.
 * Handles the nested spreading required to update round state immutably.
 *
 * @param state - The current game state
 * @param roundState - The new round state to set, or a function that receives the current round state and returns a new one
 * @returns A new game state with the updated round state
 *
 * @example
 * ```ts
 * // Replace entire round state
 * const newState = updateRoundState(state, {
 *   ...state.currentRoundState,
 *   commandedUnits: new Set([...state.currentRoundState.commandedUnits, unit]),
 * });
 *
 * // Update using a function
 * const newState = updateRoundState(state, (current) => ({
 *   ...current,
 *   roundNumber: current.roundNumber + 1,
 * }));
 * ```
 */
export function updateRoundState<TBoard extends Board>(
  state: GameState<TBoard>,
  roundState: RoundState<TBoard>,
): GameState<TBoard> {
  return {
    ...state,
    currentRoundState: roundState,
  };
}
