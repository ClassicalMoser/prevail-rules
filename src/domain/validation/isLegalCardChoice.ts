import type { Card, CardState } from '@entities';
import type { ChooseCardEvent } from '@events';

/**
 * Validates whether a card choice command is legal.
 *
 * @param cardState - The current state of all players' cards
 * @param chooseCardEvent - The card choice event to validate
 * @returns True if the card is in the player's hand, false otherwise
 */
export function isLegalCardChoice(
  cardState: CardState,
  chooseCardEvent: ChooseCardEvent,
): boolean {
  const { card } = chooseCardEvent;
  let playerHand: Card[];
  switch (chooseCardEvent.player) {
    case 'black':
      playerHand = cardState.blackPlayer.inHand;
      break;
    case 'white':
      playerHand = cardState.whitePlayer.inHand;
      break;
  }
  return playerHand.includes(card);
}
