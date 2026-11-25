import type { ValidationResult } from '@utils';
import type { MoveUnitEvent } from '@events';
import type { GameState } from '@game';
import {
  getBoardSpace,
  getMovementResolutionState,
  getUnitWithPlacementOnBoard,
  isFriendlyUnit,
  modifiersFromCompletedCommitment,
} from '@queries';
import { isResolved } from '@utils';
import { isValidMovePath } from './isValidMovePath';

/**
 * Validates a MoveUnitEvent: the move for the unit its `chooseMovingUnit`
 * named, written after its commitment (§4.3.10).
 * - the movement is waiting for its move, and it is this player's unit
 * - {@link isValidMovePath} accepts the path, counting the committed card
 * - `moveCommander` only when the player's commander shares the unit's space
 */
export function isValidMoveUnitEvent(
  event: MoveUnitEvent,
  state: GameState,
): ValidationResult {
  // The unit being moved under the Move order now being carried out; asked
  // outside one, the query throws.
  const movement = getMovementResolutionState(state);

  // A unit makes one move per order (§4.3.10): once its move is written,
  // there is no second.
  if (isResolved(movement.targetPlacement)) {
    const alreadyMoved: ValidationResult = {
      errorReason: 'This unit has already moved',
      result: false,
    };
    return alreadyMoved;
  }

  // Only the player carrying out the order moves its unit.
  if (!isFriendlyUnit(movement.movingUnit, event.player)) {
    const notTheirUnit: ValidationResult = {
      errorReason: `Expected the move from ${movement.movingUnit.playerSide}, got ${event.player}`,
      result: false,
    };
    return notTheirUnit;
  }

  // The move is from where the unit stands, which the board holds.
  const mover = getUnitWithPlacementOnBoard(state, movement.movingUnit);

  // The path must be a legal move, every step and turn of it, with
  // the card committed for it counted (§4.3.10).
  const pathValid = isValidMovePath(
    state,
    mover,
    event.path,
    'advance',
    modifiersFromCompletedCommitment(movement.commitment),
  );
  // A path the rules refuse is refused with the reason it gives.
  if (!pathValid.result) {
    return pathValid;
  }

  // Only a commander standing in the unit's space may move with it; one
  // standing anywhere else moves only in Phase 2 (§4.3.10).
  // TODO(composition): whether a side's commander stands in a space is read
  // off the space's `commanders` here, in getLegalCommanderMoves,
  // applyResolveRetreatEvent and defeatCommanderWithRoutedUnit. Settled by
  // one `@queries` reader all four ask.
  if (event.moveCommander) {
    const space = getBoardSpace(state.boardState, mover.placement.coordinate);
    if (!space.commanders.includes(event.player)) {
      const noRider: ValidationResult = {
        errorReason: `Cannot move commander with unit: commander not at ${mover.placement.coordinate}`,
        result: false,
      };
      return noRider;
    }
  }

  // A legal path, and a rider only where one stands with the unit.
  const valid: ValidationResult = { result: true };
  return valid;
}
