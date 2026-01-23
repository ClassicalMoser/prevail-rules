import type { CardState, PlayerSide } from '@entities';

/**
 * Moves a player's card from awaitingPlay to inPlay.
 * Pure function that returns new CardState.
 *
 * @param cardState - The current card state
 * @param player - The player whose card to reveal
 * @returns New CardState with the card moved from awaitingPlay to inPlay
 * @throws Error if player has no card awaiting play
 */
export function revealCard(
  cardState: CardState,
  player: PlayerSide,
): CardState {
  const playerCardState = cardState[player];
  const awaitingCard = playerCardState.awaitingPlay;

  if (!awaitingCard) {
    const capitalizedPlayer = player === 'black' ? 'Black' : 'White';
    throw new Error(`${capitalizedPlayer} player has no card awaiting play`);
  }

  const newPlayerCardState = {
    ...playerCardState,
    awaitingPlay: null,
    inPlay: awaitingCard,
  };

  return {
    ...cardState,
    [player]: newPlayerCardState,
  };
}
