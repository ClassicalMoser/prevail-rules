import type { GameState, OwnedCardState, OwnedPlayerForGameState } from '@game';

/**
 * Creates a new game state with an **owned** player's card state updated.
 *
 * Only players with an {@link OwnedCardState} slice under the state's visibility
 * may be updated ({@link OwnedPlayerForGameState}). Opponent slices on
 * `whiteSeen` / `blackSeen` stay hidden. A spectator owns neither side.
 *
 * TODO(composition): no production code calls this; only the `@testing`
 * scenarios do (`createPlayableGame`, `resolvingMoveOrder`,
 * `resolvingShootOrder`). Production writes one player's cards through
 * `updatePlayerCards`, which reads the seat at run time where this proves it
 * by type. Settle by moving those fixtures onto `updatePlayerCards` or
 * `updateCardState` and retiring this, or by saying here what it is kept for.
 *
 * @param state - The current game state
 * @param player - Owned-side player for this game state
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
export function updatePlayerCardState<S extends GameState>(
  state: S,
  player: OwnedPlayerForGameState<S>,
  playerCardState: OwnedCardState,
): S {
  // The type admits only a player whose hand this view can see, so the
  // write needs no check at run time; the other player's cards are kept.
  const updated: S = {
    ...state,
    cardState: {
      ...state.cardState,
      [player]: playerCardState,
    },
  };
  return updated;
}
