import type { ValidationResult } from '@utils';
import type { DoneIssuingCommandsEvent } from '@events';
import type { GameState } from '@game';
import { getLegalDoneIssuingCommandsEvents } from '@legality';

/**
 * Validates a DoneIssuingCommandsEvent against legal done-issuing options.
 */
export function isValidDoneIssuingCommandsEvent(
  event: DoneIssuingCommandsEvent,
  state: GameState,
): ValidationResult {
  try {
    const legalOptions = getLegalDoneIssuingCommandsEvents(state);
    if (legalOptions === null) {
      return {
        errorReason:
          'Done issuing commands is not expected in the current state',
        result: false,
      };
    }
    const isLegal = legalOptions.some(
      (option) => option.player === event.player,
    );
    if (!isLegal) {
      return {
        errorReason: `Done issuing commands is not legal for ${event.player}`,
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
