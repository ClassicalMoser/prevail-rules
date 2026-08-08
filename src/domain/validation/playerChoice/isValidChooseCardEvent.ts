import type { ValidationResult } from '@utils';
import type { ChooseCardEvent } from '@events';
import type { GameState } from '@game';
import { getLegalChooseCardOptions } from '@legality';

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
    const isLegal = legalOptions.some(
      (option) =>
        option.player === event.player && option.card.id === event.card.id,
    );
    if (!isLegal) {
      return {
        errorReason: `Command card ${event.card.id} is not a legal choice for ${event.player}`,
        result: false,
      };
    }
    return { result: true };
  } catch (error) {
    return {
      errorReason: error instanceof Error ? error.message : 'Unknown error',
      result: false,
    };
  }
}
