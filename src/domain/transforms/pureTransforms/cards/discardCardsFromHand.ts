import type { OwnedCardState } from '@entities';

/**
 * Pure transform to move specified cards from hand to discarded pile.
 * Operates on a single player's owned card state.
 *
 * @param owned - The player's current owned card state
 * @param cardIds - The IDs of the cards to discard
 * @returns A new owned card state with cards moved from hand to discarded
 */
export function discardCardsFromHand(
  owned: OwnedCardState,
  cardIds: string[],
): OwnedCardState {
  // Create set for O(1) lookup
  const cardIdSet = new Set(cardIds);

  // Separate cards to keep and cards to discard
  const cardsToKeep = owned.inHand.filter((card) => !cardIdSet.has(card.id));
  const cardsToDiscard = owned.inHand.filter((card) => cardIdSet.has(card.id));

  return {
    ...owned,
    discarded: [...owned.discarded, ...cardsToDiscard],
    inHand: cardsToKeep,
  };
}
