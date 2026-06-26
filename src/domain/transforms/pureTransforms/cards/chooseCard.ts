import type { Card, OwnedCardState } from '@entities';

/**
 * Moves a card from a player's hand to awaitingPlay (choosing a card for play).
 * Pure function operating on a single player's owned card state.
 *
 * @param owned - The player's current owned card state
 * @param card - The card to move from hand to awaitingPlay
 * @returns New owned card state with the card moved
 * @throws Error if card is not in the player's hand
 */
export function chooseCard(owned: OwnedCardState, card: Card): OwnedCardState {
  const { inHand } = owned;
  const cardInHand = inHand.find((c) => c.id === card.id);

  if (!cardInHand) {
    throw new Error(`Card ${card.id} not found in player's hand`);
  }

  const newHand = inHand.filter((c) => c.id !== card.id);

  return {
    ...owned,
    awaitingPlay: cardInHand,
    inHand: newHand,
  };
}
