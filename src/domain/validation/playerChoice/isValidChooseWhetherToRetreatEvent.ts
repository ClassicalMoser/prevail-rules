import type { ValidationResult } from '@utils';
import type { ChooseWhetherToRetreatEvent } from '@events';
import type { GameState } from '@game';
import { getLegalChooseWhetherToRetreatEvents } from '@legality';

/**
 * Validates a ChooseWhetherToRetreatEvent by membership against
 * {@link getLegalChooseWhetherToRetreatEvents}.
 */
export function isValidChooseWhetherToRetreatEvent(
  event: ChooseWhetherToRetreatEvent,
  state: GameState,
): ValidationResult {
  try {
    const legalOptions = getLegalChooseWhetherToRetreatEvents(state);
    const isLegal = legalOptions.some(
      (option) =>
        option.player === event.player &&
        option.choosesToRetreat === event.choosesToRetreat,
    );
    if (!isLegal) {
      return {
        errorReason: `Choose whether to retreat is not legal for ${event.player}`,
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
