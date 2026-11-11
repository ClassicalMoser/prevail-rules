import type { CompleteUnitMovementEvent } from '@events';
import type { GameState } from '@game';
import {
  findPositionOfUnit,
  getCommandingPlayer,
  getMovementResolutionState,
  getRemainingUnitsForPlayer,
  isSamePlacement,
} from '@queries';
import {
  carryRidingCommander,
  clearCommandResolution,
  finishResolvingCommands,
  moveUnitOnBoard,
  updateBoardState,
} from '@transforms/pureTransforms';
import { throwIfPending } from '@utils';

/**
 * Finishes a movement command-resolution slice:
 * ensures the mover is on the target space. An engage move leaves the mover on
 * its starting space until now, so it is moved onto the defender here. A mover
 * that is on neither space is a fault. Clears CRS back to `pending`, then either waits for the
 * next `moveUnit` or advances the issue-commands step when this player's
 * resolve queue is empty.
 *
 * Mirrors {@link applyCompleteRangedAttackCommandEvent} bookkeeping for movement.
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
  const mover = movementState.movingUnit.unit;

  // Where the mover stands now. An engage move leaves it on its start space
  // until now; open ground and a rear engagement have already set it down.
  const standing = findPositionOfUnit(state.boardState, mover);
  if (standing === undefined) {
    throw new Error('The moving unit is not on the board');
  }
  const arrived = standing.coordinate === targetPlacement.coordinate;
  const onStart = isSamePlacement(standing, movementState.movingUnit.placement);
  if (!arrived && !onStart) {
    throw new Error(
      'The moving unit is neither where it started nor where it was going',
    );
  }

  // A front or flank engagement places the mover only now; a commander
  // riding with it comes off the start space with it (§4.3.10).
  const boardWithMover = arrived
    ? state.boardState
    : carryRidingCommander(
        moveUnitOnBoard(state.boardState, mover, targetPlacement),
        movementState,
        targetPlacement.coordinate,
      );
  const stateWithMover =
    boardWithMover === state.boardState
      ? state
      : updateBoardState(state, boardWithMover);

  // The unit's move is done; the player's orders are finished once no
  // ordered unit is left to move.
  const cleared = clearCommandResolution(stateWithMover);
  const player = getCommandingPlayer(cleared);
  if (getRemainingUnitsForPlayer(cleared, player).length > 0) {
    return cleared;
  }
  const finished = finishResolvingCommands(cleared);
  return finished;
}
