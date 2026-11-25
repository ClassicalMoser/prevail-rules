import type { HiddenCardState, OwnedCardState } from '@game';

/** One player's card piles, whether this view can see the hand or not. */
type PlayerCardSlice = OwnedCardState | HiddenCardState;

/**
 * Moves a player's card from inPlay to played pile.
 * Works for both owned and hidden slices — `inPlay` / `played` are public on both.
 *
 * At Cleanup this round's card leaves play for the played pile (§4.5.1).
 * `moveBothInPlayToPlayed` calls it once per player.
 *
 * @param playerCards - The player's current card slice
 * @returns New card slice with the card moved to played (or unchanged if none in play)
 */
export function moveCardToPlayed<T extends PlayerCardSlice>(playerCards: T): T {
  const cardInPlay = playerCards.inPlay;

  // Every round reveals a card for each player before Cleanup (§4.1.2), so a
  // player with no card in play here is a fault, not a card to skip.
  if (!cardInPlay) {
    throw new Error('Player has no card in play');
  }

  // The card goes on top of the cards played in earlier rounds, where a
  // rally will find it (§10.3.2).
  const moved: T = {
    ...playerCards,
    inPlay: null,
    played: [...playerCards.played, cardInPlay],
  };
  return moved;
}
