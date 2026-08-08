import type { ValidationResult } from '@utils';
import type { ChooseRallyEvent } from '@events';
import type { GameState } from '@game';
import { getLegalChooseRallyEvent } from '@legality';

/**
 * Validates whether a ChooseRallyEvent is among the legal choose-rally options
 * for the current game state.
 *
 * @param event - The choose rally event to validate
 * @param state - The current game state
 * @returns ValidationResult indicating if the event is valid
 */
export function isValidChooseRallyEvent(
  event: ChooseRallyEvent,
  state: GameState,
): ValidationResult {
  try {
    const legalOptions = getLegalChooseRallyEvent(state);
    const isLegal = legalOptions.some(
      (option) =>
        option.player === event.player &&
        option.performRally === event.performRally,
    );
    if (!isLegal) {
      return {
        errorReason: `Choose rally option is not legal for ${event.player}`,
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
