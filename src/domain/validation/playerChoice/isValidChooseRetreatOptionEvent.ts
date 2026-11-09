import type { ValidationResult } from '@utils';
import type { ChooseRetreatOptionEvent } from '@events';
import type { GameState } from '@game';
import { getLegalChooseRetreatOptionEvents } from '@legality';
import { isSamePlacement } from '@queries';

/**
 * Validates a ChooseRetreatOptionEvent by membership against
 * {@link getLegalChooseRetreatOptionEvents} (placement equality on
 * coordinate + facing). Empty options → not legal.
 */
export function isValidChooseRetreatOptionEvent(
  event: ChooseRetreatOptionEvent,
  state: GameState,
): ValidationResult {
  try {
    const legalOptions = getLegalChooseRetreatOptionEvents(state);
    const isLegal = legalOptions.some(
      (option) =>
        option.player === event.player &&
        isSamePlacement(option.retreatOption, event.retreatOption),
    );
    if (!isLegal) {
      return {
        errorReason: `Retreat option ${event.retreatOption.coordinate}/${event.retreatOption.facing} is not legal for ${event.player}`,
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
