import type { ChooseCardCommand } from '@commands';
import type { Card, CardState } from '@entities';

/**
 * Validates whether a card choice command is legal.
 *
 * @param cardState - The current state of all players' cards
 * @param chooseCardCommand - The card choice command to validate
 * @returns True if the card is in the player's hand, false otherwise
 */
export function isLegalCardChoice(
  cardState: CardState,
  chooseCardCommand: ChooseCardCommand,
): boolean {
  const { card } = chooseCardCommand;
  let playerHand: Card[];
  switch (chooseCardCommand.player) {
    case 'black':
      playerHand = cardState.blackPlayer.inHand;
      break;
    case 'white':
      playerHand = cardState.whitePlayer.inHand;
      break;
  }
  return playerHand.includes(card);
}
