import type { Board, GameState, PlayerCardState } from '@entities';

/**
 * Creates a new game state with a player's card state updated.
 * Handles the nested spreading required to update player card state immutably.
 *
 * @param state - The current game state
 * @param player - The player whose card state to update
 * @param playerCardState - The new player card state to set, or a function that receives the current player card state and returns a new one
 * @returns A new game state with the updated player card state
 *
 * @example
 * ```ts
 * // Replace player's card state
 * const newState = updatePlayerCardState(state, 'black', {
 *   ...state.cardState.black,
 *   inHand: [card1, card2],
 *   awaitingPlay: null,
 * });
 *
 * // Update using a function
 * const newState = updatePlayerCardState(state, 'black', (current) => ({
 *   ...current,
 *   inHand: [...current.inHand, newCard],
 * }));
 * ```
 */
export function updatePlayerCardState<TBoard extends Board>(
  state: GameState<TBoard>,
  player: 'black' | 'white',
  playerCardState:
    | PlayerCardState
    | ((current: PlayerCardState) => PlayerCardState),
): GameState<TBoard> {
  const currentPlayerCardState = state.cardState[player];
  const newPlayerCardState =
    typeof playerCardState === 'function'
      ? playerCardState(currentPlayerCardState)
      : playerCardState;

  return {
    ...state,
    cardState: {
      ...state.cardState,
      [player]: newPlayerCardState,
    },
  };
}
