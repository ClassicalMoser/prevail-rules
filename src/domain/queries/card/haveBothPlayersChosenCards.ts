import type { CardState } from '@game';

/**
 * Whether both players have chosen the card they will play (§4.1.1). The
 * choices are made at the same time and kept face down until both are in, so
 * a chosen card is one waiting to be revealed. Every view of the game can say
 * whether a card waits, even where it cannot say which.
 *
 * @param cardState - The card state, under any visibility
 * @returns True when each player has a card waiting to be revealed
 */
export function haveBothPlayersChosenCards(cardState: CardState): boolean {
  const both =
    cardState.black.awaitingPlay !== null &&
    cardState.white.awaitingPlay !== null;
  return both;
}
