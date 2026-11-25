import type { CommandCard, PlayerSide } from '@entities';
import type { CardState } from '@game';

/**
 * The card a player has in play, or `undefined` before the cards are
 * revealed. The card in play lies face up for every viewer (§4.1.2), so any
 * view of the game can read it.
 *
 * Callers that know the round is past the reveal use `getCardInPlay`.
 *
 * @param cardState - The card state, under any visibility
 * @param player - The player whose card to read
 * @returns That player's card in play, or `undefined` when none is in play
 */
export function findCardInPlay(
  cardState: CardState,
  player: PlayerSide,
): CommandCard | undefined {
  // The in-play slot is empty until the reveal, and empty again once the card
  // goes to the played pile at cleanup (§4.5.1); an empty slot reads as no
  // card.
  const card = cardState[player].inPlay ?? undefined;
  return card;
}
