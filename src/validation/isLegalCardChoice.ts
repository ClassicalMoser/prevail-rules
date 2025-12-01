import type { ChooseCardCommand } from "src/commands/chooseCard.js";
import type { Card } from "src/entities/card/card.js";
import type { CardState } from "src/entities/card/cardState.js";

export function isLegalCardChoice(
  cardState: CardState,
  chooseCardCommand: ChooseCardCommand,
): boolean {
  const { card } = chooseCardCommand;
  let playerHand: Card[];
  switch (chooseCardCommand.player) {
    case "black":
      playerHand = cardState.blackPlayer.inHand;
      break;
    case "white":
      playerHand = cardState.whitePlayer.inHand;
      break;
  }
  return playerHand.includes(card);
}
