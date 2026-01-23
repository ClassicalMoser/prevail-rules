import type { CardState, PlayerSide } from '@entities';

/**
 * Moves a player's card from inPlay to played pile.
 * Pure function that returns new CardState.
 *
 * @param cardState - The current card state
 * @param player - The player whose card to move to played pile
 * @returns New CardState with the card moved to played
 */
export function moveCardToPlayed(
  cardState: CardState,
  player: PlayerSide,
): CardState {
  const playerCardState = cardState[player];
  const cardInPlay = playerCardState.inPlay;

  if (!cardInPlay) {
    // No card to move, return unchanged
    return cardState;
  }

  const newPlayerCardState = {
    ...playerCardState,
    inPlay: null,
    played: [...playerCardState.played, cardInPlay],
  };

  return {
    ...cardState,
    [player]: newPlayerCardState,
  };
}
