import type { HiddenCardState } from '@game';
import type { GameStateForVisibility, UnownedPlayerForGameState } from '@game';

/**
 * Creates a new game state with an **unowned** (hidden) player's card state updated.
 *
 * Only players with a {@link HiddenCardState} slice under the state's visibility
 * may be updated ({@link UnownedPlayerForGameState}). Authoritative has no
 * unowned side.
 *
 * @param state - The current game state (`whiteSeen` or `blackSeen`)
 * @param player - Unowned-side player for this game state
 * @param playerCardState - The new hidden card state to set for the player
 * @returns A new game state with the updated player card state
 */
export function updateHiddenPlayerCardState<
  S extends
    | GameStateForVisibility<'whiteSeen'>
    | GameStateForVisibility<'blackSeen'>,
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
