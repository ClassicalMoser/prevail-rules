import type { Board, GameState, ValidationResult } from '@entities';
import type { MoveCommanderEvent } from '@events';
import { getOtherPlayer } from '@queries';
import { getMoveCommandersPhaseState } from '@queries/sequencing';

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

    // getMoveCommandersPhaseState throws if not in moveCommanders phase
    const phaseState = getMoveCommandersPhaseState(state);
    const firstPlayer = state.currentInitiative;
    const secondPlayer = getOtherPlayer(firstPlayer);

    switch (phaseState.step) {
      case 'moveFirstCommander':
        if (player !== firstPlayer) {
          return {
            result: false,
            errorReason: `Expected ${firstPlayer} (initiative player) to move, not ${player}`,
          };
        }
        return { result: true };

      case 'moveSecondCommander':
        if (player !== secondPlayer) {
          return {
            result: false,
            errorReason: `Expected ${secondPlayer} (non-initiative player) to move, not ${player}`,
          };
        }
        return { result: true };

      case 'complete':
        return {
          result: false,
          errorReason: `Move commanders phase is on complete step, not moveFirstCommander or moveSecondCommander`,
        };

      default: {
        const _exhaustive: never = phaseState.step;
        return {
          result: false,
          errorReason: `Invalid moveCommanders phase step: ${_exhaustive}`,
        };
      }
    }
  } catch (error) {
    return {
      result: false,
      errorReason: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
