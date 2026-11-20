import type { CompleteUnitMovementEvent } from '@events';
import type { GameState } from '@game';
import { getMovementResolutionState, isSamePlacement } from '@queries';
import {
  carryRidingCommander,
  clearCommandResolution,
  moveUnitOnBoard,
  updateBoardState,
} from '@transforms/pureTransforms';
import { throwIfPending } from '@utils';

/**
 * Finishes a movement command-resolution slice:
 * ensures the mover is on the target space. A front engagement
 * leaves the mover on its starting space until now, so it is moved onto the
 * defender here; the movement's record of where the mover stands says which.
 * Clears CRS back to `pending`. Whether
 * the order goes on to another unit, or ends with completeMovementCommand, is
 * the expected engine's to ask for.
 *
 * Mirrors `applyCompleteRangedAttackEvent` for a shot.
 */
export function applyCompleteUnitMovementEvent<S extends GameState>(
  _event: CompleteUnitMovementEvent,
  state: S,
): S {
  const movementState = getMovementResolutionState(state);
  // A move is only completed once it has been written.
  const targetPlacement = throwIfPending(
    movementState.targetPlacement,
    'The move has not been written yet',
  );
  const { movingUnit } = movementState;

  // The movement records where the mover stands. Open ground and a rear or
  // flank engagement have already set it down; a front engagement left it
  // on its start space until now.
  const arrived = isSamePlacement(movingUnit.placement, targetPlacement);

  // A front engagement places the mover only now; a commander
  // riding with it comes off the start space with it (§4.3.10).
  const boardWithMover = arrived
    ? state.boardState
    : carryRidingCommander(
        moveUnitOnBoard(state, movingUnit.unit, targetPlacement),
        movementState,
        targetPlacement.coordinate,
      );
  const stateWithMover =
    boardWithMover === state.boardState
      ? state
      : updateBoardState(state, boardWithMover);

  // The unit's move is done. Whether the order goes on to another unit or
  // ends is the expected engine's to ask for.
  const cleared = clearCommandResolution(stateWithMover);
  return cleared;
}
