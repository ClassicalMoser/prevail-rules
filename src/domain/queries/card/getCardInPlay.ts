import type { CommandCard, PlayerSide } from '@entities';
import type { CardState } from '@game';
import { findCardInPlay } from './findCardInPlay';

/**
 * The card a player has in play, where the caller knows the cards are
 * revealed: from initiative to cleanup, each player's card grants the
 * round's orders (§4.1.6).
 *
 * @param cardState - The card state, under any visibility
 * @param player - The player whose card to read
 * @returns That player's card in play
 * @throws Error when the player has no card in play
 */
export function getCardInPlay(
  cardState: CardState,
  player: PlayerSide,
): CommandCard {
  const card = findCardInPlay(cardState, player);
  if (card === undefined) {
    throw new Error(`${player} has no card in play`);
  }
  return card;
}
