import type { ValidationResult } from '@utils';
import type { MoveCommanderEvent } from '@events';
import type { GameState } from '@game';
import { getLegalCommanderMoves } from '@legality';
import { getCommanderSpace } from '@queries';

/**
 * Validates whether a MoveCommanderEvent destination is among the legal
 * commander moves from where the commander stands. The event names only the
 * destination; where the commander stands is read from the board.
 *
 * @param event - The move commander event to validate
 * @param state - The current game state
 * @returns ValidationResult indicating if the event is valid
 */
export function isValidMoveCommanderEvent(
  event: MoveCommanderEvent,
  state: GameState,
): ValidationResult {
  // Where the commander stands now; a side asked to move it has it on the
  // board, as a fallen one's turn is passed over.
  const from = getCommanderSpace(event.player, state);

  // Every space the commander may end on from there: up to four spaces, never
  // into or through an enemy's space, nor across a diagonal enemies block,
  // and its own space too, since it may stay (§4.2.2–4.2.6).
  const legalDestinations = getLegalCommanderMoves(event.player, state, from);

  // The destination the player named must be one of them.
  if (!legalDestinations.has(event.to)) {
    const notLegal: ValidationResult = {
      errorReason: `Destination ${event.to} is not a legal commander move for ${event.player} from ${from}`,
      result: false,
    };
    return notLegal;
  }

  // The commander may end its move there.
  const valid: ValidationResult = { result: true };
  return valid;
}
