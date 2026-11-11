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
  const legalOptions = getLegalDoneIssuingCommandsEvents(state);
  const isLegal = legalOptions.some((option) => option.player === event.player);
  if (!isLegal) {
    return {
      errorReason: `Done issuing commands is not legal for ${event.player}`,
      result: false,
    };
  }
  return { result: true };
}
