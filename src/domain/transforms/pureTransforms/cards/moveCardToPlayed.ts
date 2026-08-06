import type { HiddenCardState, OwnedCardState } from '@entities';

type PlayerCardSlice = OwnedCardState | HiddenCardState;

/**
 * Moves a player's card from inPlay to played pile.
 * Works for both owned and hidden slices — `inPlay` / `played` are public on both.
 *
 * @param playerCards - The player's current card slice
 * @returns New card slice with the card moved to played (or unchanged if none in play)
 */
export function moveCardToPlayed<T extends PlayerCardSlice>(playerCards: T): T {
  const cardInPlay = playerCards.inPlay;

  if (!cardInPlay) {
    return playerCards;
  }

  return {
    ...playerCards,
    inPlay: null,
    played: [...playerCards.played, cardInPlay],
  };
}
