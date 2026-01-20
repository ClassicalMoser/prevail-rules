import type { Card, CardState, PlayerSide } from '@entities';

/**
 * Burns a specific card from the player's played pile.
 * Pure function that returns new CardState.
 *
 * @param cardState - The current card state
 * @param player - The player whose card to burn
 * @param card - The card to burn
 * @returns New CardState with the card burned
 * @throws Error if card is not in played pile
 */
export function burnCardFromPlayed(
  cardState: CardState,
  player: PlayerSide,
  card: Card,
): CardState {
  const playerCardState = cardState[player];
  
  const cardIndex = playerCardState.played.findIndex((c) => c.id === card.id);
  if (cardIndex === -1) {
    throw new Error(`Card ${card.id} not found in ${player} player's played cards`);
  }

  const newPlayed = playerCardState.played.filter((c) => c.id !== card.id);
  const newBurnt = [...playerCardState.burnt, card];

  const newPlayerCardState = {
    ...playerCardState,
    played: newPlayed,
    burnt: newBurnt,
  };

  return {
    ...cardState,
    [player]: newPlayerCardState,
  };
}
