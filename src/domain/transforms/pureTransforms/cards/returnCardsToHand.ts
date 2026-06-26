import type { OwnedCardState } from '@entities';

/**
 * Returns all played and discarded cards to the player's hand.
 * Pure function operating on a single player's owned card state.
 *
 * @param owned - The player's current owned card state
 * @returns New owned card state with played and discarded cards returned to hand
 */
export function returnCardsToHand(owned: OwnedCardState): OwnedCardState {
  const newHand = [...owned.inHand, ...owned.played, ...owned.discarded];

  return {
    ...owned,
    discarded: [],
    inHand: newHand,
    played: [],
  };
}
