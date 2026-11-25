import type { ValidationResult } from '@utils';
import type { ChooseCardEvent } from '@events';
import type { GameState } from '@game';
import { getLegalChooseCardOptions } from '@legality';
import { isSameCard, isSameCardValue } from '@queries';

// TODO(misleading): the JSDoc says a wrong phase or step yields an empty
// option list and so a refusal with no throw. `getLegalChooseCardOptions`
// throws off the chooseCards step, and the entry point turns that into the
// refusal; only a player who has already chosen gets an empty offer. Settled
// by rewording the second paragraph to say so.
/**
 * Validates whether a ChooseCardEvent is among the legal choose-card options
 * for the current game state (typically authoritative on the engine).
 *
 * Membership is against {@link getLegalChooseCardOptions}: wrong phase/step or
 * an already-committed player yields an empty option list, so this returns
 * `result: false` with a “not a legal choice” reason (no throw).
 *
 * @param event - The choose card event to validate
 * @param state - The current game state
 * @returns ValidationResult indicating if the event is valid
 */
export function isValidChooseCardEvent(
  event: ChooseCardEvent,
  state: GameState,
): ValidationResult {
  // Each card still in the hand of a player who has not yet chosen may be
  // the one laid face down this round (§4.1.1).
  const legalOptions = getLegalChooseCardOptions(state);

  // The card must be one this player holds, named by its id: an army holds
  // no card twice (§3.1.5). Both players choose at once, so the offer holds
  // both hands, and a card from the other player's hand is not this
  // player's to play.
  const legalOption = legalOptions.find(
    (option) =>
      option.player === event.player && isSameCard(option.card, event.card),
  );
  if (legalOption === undefined) {
    const notLegal: ValidationResult = {
      errorReason: `Command card ${event.card.id} is not a legal choice for ${event.player}`,
      result: false,
    };
    return notLegal;
  }

  // The id names a card the player holds; the card the event shows must be
  // that card, since everyone folds it as shown.
  const sameCard = isSameCardValue(legalOption.card, event.card);
  if (!sameCard.result) {
    // The reason names the first part of the card that was altered.
    return sameCard;
  }

  // A card from the player's own hand, shown as the hand holds it.
  const valid: ValidationResult = { result: true };
  return valid;
}
