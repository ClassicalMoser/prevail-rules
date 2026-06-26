import type { Board, OwnedCardState } from '@entities';
import type { GameStateForBoard } from '@game';

/**
 * Creates a new game state with a player's card state updated.
 * Handles the nested spreading required to update player card state immutably.
 *
 * @param state - The current game state
 * @param player - The player whose card state to update
 * @param playerCardState - The new owned card state to set for the player
 * @returns A new game state with the updated player card state
 *
 * @example
 * ```ts
 * const newState = updatePlayerCardState(state, 'black', {
 *   ...state.cardState.black,
 *   inHand: [card1, card2],
 *   awaitingPlay: null,
 * });
 * ```
 */
export function updatePlayerCardState<TBoard extends Board>(
  state: GameStateForBoard<TBoard>,
  player: 'black' | 'white',
  playerCardState: OwnedCardState,
): GameStateForBoard<TBoard> {
  return {
    ...state,
    cardState: {
      ...state.cardState,
      [player]: playerCardState,
    },
  };
}
