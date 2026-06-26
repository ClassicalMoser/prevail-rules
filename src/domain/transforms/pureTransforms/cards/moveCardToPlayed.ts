import type { OwnedCardState } from '@entities';

/**
 * Moves a player's card from inPlay to played pile.
 * Pure function operating on a single player's owned card state.
 *
 * @param owned - The player's current owned card state
 * @returns New owned card state with the card moved to played
 */
export function moveCardToPlayed(owned: OwnedCardState): OwnedCardState {
  const cardInPlay = owned.inPlay;

  if (!cardInPlay) {
    // No card to move, return unchanged
    return owned;
  }

  return {
    ...owned,
    inPlay: null,
    played: [...owned.played, cardInPlay],
  };
}
