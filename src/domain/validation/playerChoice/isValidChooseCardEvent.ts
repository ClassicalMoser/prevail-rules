import type { ValidationResult } from '@utils';
import type { ChooseCardEvent } from '@events';
import type { GameState } from '@game';
import { getLegalChooseCardOptions } from '@legality';
import { isSameCard, isSameCardValue } from '@queries';

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
  try {
    const legalOptions = getLegalChooseCardOptions(state);
    const legalOption = legalOptions.find(
      (option) =>
        option.player === event.player &&
        isSameCard(option.card, event.card).result,
    );
    if (legalOption === undefined) {
      return {
        errorReason: `Command card ${event.card.id} is not a legal choice for ${event.player}`,
        result: false,
      };
    }
    // The id names a card the player holds; the card the event shows must be
    // that card, since everyone folds it as shown.
    const sameCard = isSameCardValue(legalOption.card, event.card);
    if (!sameCard.result) {
      return sameCard;
    }
    return { result: true };
  } catch (error) {
    return {
      errorReason: error instanceof Error ? error.message : 'Unknown error',
      result: false,
    };
  }
}
