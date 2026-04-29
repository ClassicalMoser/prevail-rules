import type { Card, CardState, PlayerSide } from "@entities";

/**
 * Moves a card from a player's hand to awaitingPlay (choosing a card for play).
 * Pure function that returns new CardState.
 *
 * @param cardState - The current card state
 * @param player - The player choosing the card
 * @param card - The card to move from hand to awaitingPlay
 * @returns New CardState with the card moved
 * @throws Error if card is not in the player's hand
 */
export function chooseCard(cardState: CardState, player: PlayerSide, card: Card): CardState {
  const playerCardState = cardState[player];
  const inHand = playerCardState.inHand;
  const cardInHand = inHand.find((c) => c.id === card.id);

  if (!cardInHand) {
    const capitalizedPlayer = player === "black" ? "Black" : "White";
    throw new Error(`Card ${card.id} not found in ${capitalizedPlayer} player's hand`);
  }

  const newHand = inHand.filter((c) => c.id !== card.id);

  return {
    ...cardState,
    [player]: {
      ...playerCardState,
      inHand: newHand,
      awaitingPlay: cardInHand,
    },
  };
}
