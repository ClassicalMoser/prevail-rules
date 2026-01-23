import type { Board, CardState, GameState } from '@entities';

/**
 * Creates a new game state with the card state updated.
 * Handles the nested spreading required to update card state immutably.
 *
 * @param state - The current game state
 * @param cardState - The new card state to set, or a function that receives the current card state and returns a new one
 * @returns A new game state with the updated card state
 *
 * @example
 * ```ts
 * // Replace entire card state
 * const newState = updateCardState(state, {
 *   black: { ...state.cardState.black, inHand: [card1, card2] },
 *   white: state.cardState.white,
 * });
 *
 * // Update using a function
 * const newState = updateCardState(state, (current) => ({
 *   ...current,
 *   black: { ...current.black, inHand: [card1, card2] },
 * }));
 * ```
 */
export function updateCardState<TBoard extends Board>(
  state: GameState<TBoard>,
  cardState: CardState | ((current: CardState) => CardState),
): GameState<TBoard> {
  const newCardState =
    typeof cardState === 'function' ? cardState(state.cardState) : cardState;
  return {
    ...state,
    cardState: newCardState,
  };
}
