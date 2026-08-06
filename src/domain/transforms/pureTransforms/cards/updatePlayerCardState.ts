import type { OwnedCardState } from '@entities';
import type { GameStateForVisibility, GameStateVisibility, OwnedPlayerForVisibility } from '@game';

/**
 * Creates a new game state with an **owned** player's card state updated.
 *
 * Only players with an {@link OwnedCardState} slice under the state's visibility
 * may be updated ({@link OwnedPlayerForVisibility}). Opponent slices on
 * `whiteSeen` / `blackSeen` stay hidden.
 *
 * @param state - The current game state
 * @param player - Owned-side player for this visibility
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
export function updatePlayerCardState<V extends GameStateVisibility>(
  state: GameStateForVisibility<V>,
  player: OwnedPlayerForVisibility<V>,
  playerCardState: OwnedCardState,
): GameStateForVisibility<V> {
  return {
    ...state,
    cardState: {
      ...state.cardState,
      [player]: playerCardState,
    },
  } as GameStateForVisibility<V>;
}
