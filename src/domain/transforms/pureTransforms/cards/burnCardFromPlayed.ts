import type { Card, OwnedCardState } from '@entities';

/**
 * Burns a specific card from the player's played pile.
 * Pure function operating on a single player's owned card state.
 *
 * @param owned - The player's current owned card state
 * @param card - The card to burn
 * @returns New owned card state with the card burned
 * @throws Error if card is not in played pile
 */
export function burnCardFromPlayed(
  owned: OwnedCardState,
  card: Card,
): OwnedCardState {
  const cardIndex = owned.played.findIndex((c) => c.id === card.id);
  if (cardIndex === -1) {
    throw new Error(`Card ${card.id} not found in player's played cards`);
  }

  const newPlayed = owned.played.filter((c) => c.id !== card.id);
  const newBurnt = [...owned.burnt, card];

  return {
    ...owned,
    burnt: newBurnt,
    played: newPlayed,
  };
}
