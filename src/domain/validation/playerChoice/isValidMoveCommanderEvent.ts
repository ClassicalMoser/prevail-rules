import type { ValidationResult } from '@utils';
import type { MoveCommanderEvent } from '@events';
import type { GameState } from '@game';
import { getLegalCommanderMoves } from '@legality';

/**
 * Validates whether a MoveCommanderEvent destination is among the legal
 * commander moves from the event's starting coordinate.
 *
 * @param event - The move commander event to validate
 * @param state - The current game state
 * @returns ValidationResult indicating if the event is valid
 */
export function isValidMoveCommanderEvent(
  event: MoveCommanderEvent,
  state: GameState,
): ValidationResult {
  try {
    const legalDestinations = getLegalCommanderMoves(
      event.player,
      state,
      event.from,
    );
    if (!legalDestinations.has(event.to)) {
      return {
        errorReason: `Destination ${event.to} is not a legal commander move for ${event.player} from ${event.from}`,
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
