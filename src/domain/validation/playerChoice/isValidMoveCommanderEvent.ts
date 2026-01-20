import type { Board, GameState, ValidationResult } from '@entities';
import type { MoveCommanderEvent } from '@events';
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
  event: MoveCommanderEvent<TBoard>,
  state: GameState<TBoard>,
): ValidationResult {
  try {
    const { player } = event;
    const currentPhaseState = state.currentRoundState.currentPhaseState;

    // Check phase state exists
    if (!currentPhaseState) {
      return {
        result: false,
        errorReason: 'No current phase state found',
      };
    }

    // Check correct phase
    if (currentPhaseState.phase !== 'moveCommanders') {
      return {
        result: false,
        errorReason: `Current phase is ${currentPhaseState.phase}, not moveCommanders`,
      };
    }

    // Check correct step and player
    const firstPlayer = state.currentInitiative;
    const secondPlayer = getOtherPlayer(firstPlayer);

    if (currentPhaseState.step === 'moveFirstCommander') {
      if (player !== firstPlayer) {
        return {
          result: false,
          errorReason: `Expected ${firstPlayer} (initiative player) to move, not ${player}`,
        };
      }
    } else if (currentPhaseState.step === 'moveSecondCommander') {
      if (player !== secondPlayer) {
        return {
          result: false,
          errorReason: `Expected ${secondPlayer} (non-initiative player) to move, not ${player}`,
        };
      }
    } else {
      return {
        result: false,
        errorReason: `Move commanders phase is on ${currentPhaseState.step} step, not moveFirstCommander or moveSecondCommander`,
      };
    }

    // Valid
    return {
      result: true,
    };
  } catch (error) {
    return {
      result: false,
      errorReason: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
