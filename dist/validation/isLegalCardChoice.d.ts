import type { ChooseCardCommand } from "src/commands/chooseCard.js";
import type { CardState } from "src/entities/card/cardState.js";
/**
 * Validates whether a card choice command is legal.
 *
 * @param cardState - The current state of all players' cards
 * @param chooseCardCommand - The card choice command to validate
 * @returns True if the card is in the player's hand, false otherwise
 */
export declare function isLegalCardChoice(cardState: CardState, chooseCardCommand: ChooseCardCommand): boolean;
//# sourceMappingURL=isLegalCardChoice.d.ts.map