import type { CardState, GameState } from '@game';

/**
 * The game with its card state replaced. Cards move between piles for many
 * reasons, so the callers say how; this only writes the result back.
 *
 * TODO(misleading): the return type promises `S`, the visibility of the game
 * given, but `cardState` may be of any visibility, so a seat's view can be
 * written into the full record and still type as it. Settle by typing the
 * parameter `S['cardState']`, as `updateCardState` in `@testing` does, and
 * making `moveBothInPlayToPlayed` and the two `replace*PlayerCardState`
 * writers generic over the card state, as `revealBothAwaitingCards` is.
 *
 * @param state - The game state
 * @param cardState - The new card state, under the same visibility
 * @returns The game state holding it
 */
export function replaceCardState<S extends GameState>(
  state: S,
  cardState: CardState,
): S {
  // Everything but the cards, from the board to the round, is as it was.
  const updated = { ...state, cardState };
  return updated;
}
