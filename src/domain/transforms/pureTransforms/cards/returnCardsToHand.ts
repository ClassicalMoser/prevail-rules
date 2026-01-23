import type { CardState, PlayerSide } from '@entities';

/**
 * Returns all played and discarded cards to the player's hand.
 * Pure function that returns new CardState.
 *
 * @param cardState - The current card state
 * @param player - The player whose cards to return
 * @returns New CardState with played and discarded cards returned to hand
 */
export function returnCardsToHand(
  cardState: CardState,
  player: PlayerSide,
): CardState {
  const playerCardState = cardState[player];

  const newHand = [
    ...playerCardState.inHand,
    ...playerCardState.played,
    ...playerCardState.discarded,
  ];

  const newPlayerCardState = {
    ...playerCardState,
    inHand: newHand,
    played: [],
    discarded: [],
  };

  return {
    ...cardState,
    [player]: newPlayerCardState,
  };
}
