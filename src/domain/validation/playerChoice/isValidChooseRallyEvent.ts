import type { Board, ValidationResult } from '@entities';
import type { ChooseRallyEvent } from '@events';
import type { GameStateForBoard } from '@game';
import { getOtherPlayer } from '@queries';
/**
 * Validates whether a ChooseRallyEvent can be applied to the current game state.
 * This is used for proactive validation before attempting to apply the event.
 *
 * @param event - The choose rally event to validate
 * @param state - The current game state
 * @returns ValidationResult indicating if the event is valid
 *
 * @example
 * ```typescript
 * const validation = isValidChooseRallyEvent(event, state);
 * if (!validation.result) {
 *   // Reject the event without processing
 *   return { success: false, error: validation.errorReason };
 * }
 * // Proceed to apply the event
 * const newState = applyChooseRallyEvent(event, state);
 * ```
 */
export function isValidChooseRallyEvent<TBoard extends Board>(
  event: ChooseRallyEvent,
  state: GameStateForBoard<TBoard>,
): ValidationResult {
  try {
    const { player } = event;
    const { currentPhaseState } = state.currentRoundState;

    // Check phase state exists
    if (currentPhaseState === 'none') {
      return {
        errorReason: 'No current phase state found',
        result: false,
      };
    }

    // Check correct phase
    if (currentPhaseState.phase !== 'cleanup') {
      return {
        errorReason: `Current phase is ${currentPhaseState.phase}, not cleanup`,
        result: false,
      };
    }

    // Check correct step and player
    const firstPlayer = state.currentInitiative;
    const secondPlayer = getOtherPlayer(firstPlayer);

    if (currentPhaseState.step === 'firstPlayerChooseRally') {
      if (player !== firstPlayer) {
        return {
          errorReason: `Expected ${firstPlayer} (first player) to choose rally, not ${player}`,
          result: false,
        };
      }
    } else if (currentPhaseState.step === 'secondPlayerChooseRally') {
      if (player !== secondPlayer) {
        return {
          errorReason: `Expected ${secondPlayer} (second player) to choose rally, not ${player}`,
          result: false,
        };
      }
    } else {
      return {
        errorReason: `Cleanup phase is on ${currentPhaseState.step} step, not a chooseRally step`,
        result: false,
      };
    }

    // Valid
    return {
      result: true,
    };
  } catch (error) {
    return {
      errorReason: error instanceof Error ? error.message : 'Unknown error',
      result: false,
    };
  }
}
