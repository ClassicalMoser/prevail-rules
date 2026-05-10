import type { Board, ValidationResult } from '@entities';
import type { MoveCommanderEventForBoard } from '@events';
import type { GameStateForBoard } from '@game';
import { getOtherPlayer } from '@queries';

/**
 * Validates whether a MoveCommanderEvent can be applied to the current game state.
 * This is used for proactive validation before attempting to apply the event.
 *
 * @param event - The move commander event to validate
 * @param state - The current game state
 * @returns ValidationResult indicating if the event is valid
 *
 * @example
 * ```typescript
 * const validation = isValidMoveCommanderEvent(event, state);
 * if (!validation.result) {
 *   // Reject the event without processing
 *   return { success: false, error: validation.errorReason };
 * }
 * // Proceed to apply the event
 * const newState = applyMoveCommanderEvent(event, state);
 * ```
 */
export function isValidMoveCommanderEvent<TBoard extends Board>(
  event: MoveCommanderEventForBoard<TBoard>,
  state: GameStateForBoard<TBoard>,
): ValidationResult {
  try {
    const { player } = event;
    const { currentPhaseState } = state.currentRoundState;

    // Check phase state exists
    if (!currentPhaseState) {
      return {
        errorReason: 'No current phase state found',
        result: false,
      };
    }

    // Check correct phase
    if (currentPhaseState.phase !== 'moveCommanders') {
      return {
        errorReason: `Current phase is ${currentPhaseState.phase}, not moveCommanders`,
        result: false,
      };
    }

    // Check correct step and player
    const firstPlayer = state.currentInitiative;
    const secondPlayer = getOtherPlayer(firstPlayer);

    if (currentPhaseState.step === 'moveFirstCommander') {
      if (player !== firstPlayer) {
        return {
          errorReason: `Expected ${firstPlayer} (initiative player) to move, not ${player}`,
          result: false,
        };
      }
    } else if (currentPhaseState.step === 'moveSecondCommander') {
      if (player !== secondPlayer) {
        return {
          errorReason: `Expected ${secondPlayer} (non-initiative player) to move, not ${player}`,
          result: false,
        };
      }
    } else {
      return {
        errorReason: `Move commanders phase is on ${currentPhaseState.step} step, not moveFirstCommander or moveSecondCommander`,
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
