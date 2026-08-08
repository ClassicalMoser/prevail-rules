import type { ValidationResult } from '@utils';
import type { ChooseMeleeResolutionEvent } from '@events';
import type { GameState } from '@game';
import { getLegalChooseMeleeResolutionEvents } from '@legality';

/**
 * Validates whether a choose melee resolution event is among the legal options
 * for the current game state.
 *
 * @param event - The choose melee resolution event to validate
 * @param state - The current game state
 * @returns ValidationResult indicating if the event is valid
 */
export function isValidChooseMeleeResolutionEvent(
  event: ChooseMeleeResolutionEvent,
  state: GameState,
): ValidationResult {
  try {
    const legalOptions = getLegalChooseMeleeResolutionEvents(state);
    const isLegal = legalOptions.some(
      (option) =>
        option.player === event.player && option.space === event.space,
    );
    if (!isLegal) {
      return {
        errorReason: `Space ${event.space} is not a legal melee resolution choice for ${event.player}`,
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
