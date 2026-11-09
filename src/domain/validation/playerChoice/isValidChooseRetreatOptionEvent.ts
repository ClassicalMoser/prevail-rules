import type { ValidationResult } from '@utils';
import type { ChooseRetreatOptionEvent } from '@events';
import type { GameState } from '@game';
import { getLegalChooseRetreatOptionEvents } from '@legality';
import { isSameMovePath } from '@queries';

/**
 * Validates a ChooseRetreatOptionEvent by membership against
 * {@link getLegalChooseRetreatOptionEvents}: the path must be one of the
 * retreats offered (§9.1.3). Empty options → not legal.
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
        isSameMovePath(option.path, event.path),
    );
    if (!isLegal) {
      return {
        errorReason: `Retreat path ${event.path.join(', ')} is not one offered to ${event.player}`,
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
