import type {
  BlackSeenGameState,
  HiddenCardState,
  SpectatorGameState,
  UnownedPlayerForGameState,
  WhiteSeenGameState,
} from '@game';

/**
 * Creates a new game state with an **unowned** (hidden) player's card state updated.
 *
 * Only players with a {@link HiddenCardState} slice under the state's visibility
 * may be updated ({@link UnownedPlayerForGameState}). Authoritative has no
 * unowned side.
 *
 * @param state - The current game state (`whiteSeen`, `blackSeen`, or `spectator`)
 * @param player - Unowned-side player for this game state
 * @param playerCardState - The new hidden card state to set for the player
 * @returns A new game state with the updated player card state
 */
export function updateHiddenPlayerCardState<
  S extends WhiteSeenGameState | BlackSeenGameState | SpectatorGameState,
>(
  state: S,
  player: UnownedPlayerForGameState<S>,
  playerCardState: HiddenCardState,
): S {
  return {
    ...state,
    cardState: {
      ...state.cardState,
      [player]: playerCardState,
    },
  };
}
