import type { Board, GameState, ValidationResult } from '@entities';
import type { ChooseRallyEvent } from '@events';
import { getOtherPlayer } from '@queries';
import { getCleanupPhaseState } from '@queries/sequencing';

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
  event: ChooseRallyEvent<TBoard>,
  state: GameState<TBoard>,
): ValidationResult {
  try {
    const { player } = event;

    // getCleanupPhaseState throws if not in cleanup phase
    const phaseState = getCleanupPhaseState(state);
    const firstPlayer = state.currentInitiative;
    const secondPlayer = getOtherPlayer(firstPlayer);

    switch (phaseState.step) {
      case 'firstPlayerChooseRally':
        if (player !== firstPlayer) {
          return {
            result: false,
            errorReason: `Expected ${firstPlayer} (first player) to choose rally, not ${player}`,
          };
        }
        return { result: true };

      case 'secondPlayerChooseRally':
        if (player !== secondPlayer) {
          return {
            result: false,
            errorReason: `Expected ${secondPlayer} (second player) to choose rally, not ${player}`,
          };
        }
        return { result: true };

      default:
        return {
          result: false,
          errorReason: `Cleanup phase is on ${phaseState.step} step, not a chooseRally step`,
        };
    }
  } catch (error) {
    return {
      result: false,
      errorReason: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
