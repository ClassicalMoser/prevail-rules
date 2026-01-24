import type { CardState, PlayerSide } from '@entities';

/**
 * Pure transform to move specified cards from hand to discarded pile.
 *
 * @param cardState - The current card state
 * @param player - The player whose cards are being discarded
 * @param cardIds - The IDs of the cards to discard
 * @returns A new card state with cards moved from hand to discarded
 */
export function discardCardsFromHand(
  cardState: CardState,
  player: PlayerSide,
  cardIds: string[],
): CardState {
  const playerCardState = cardState[player];
  const cardsInHand = playerCardState.inHand;

  // Create set for O(1) lookup
  const cardIdSet = new Set(cardIds);

  // Separate cards to keep and cards to discard
  const cardsToKeep = cardsInHand.filter((card) => !cardIdSet.has(card.id));
  const cardsToDiscard = cardsInHand.filter((card) => cardIdSet.has(card.id));

  // Return new card state
  return {
    ...cardState,
    [player]: {
      ...playerCardState,
      inHand: cardsToKeep,
      discarded: [...playerCardState.discarded, ...cardsToDiscard],
    },
  };
}
