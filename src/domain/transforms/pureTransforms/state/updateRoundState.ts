import type { GameState, RoundState } from '@game';

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
// TODO(misleading): the header offers "a function that receives the current
// round state" and shows `commandedUnits` as a `Set`; neither is so. Only a
// whole `RoundState` is taken, and `commandedUnits` is a list. Settle by
// trimming the header to the signature.
export function updateRoundState<S extends GameState>(
  state: S,
  roundState: RoundState,
): S {
  // The whole round is replaced at once: a new round beginning, or the
  // round's record of what has happened in it growing.
  const withRound: S = {
    ...state,
    currentRoundState: roundState,
  };

  // The state with that round.
  return withRound;
}
