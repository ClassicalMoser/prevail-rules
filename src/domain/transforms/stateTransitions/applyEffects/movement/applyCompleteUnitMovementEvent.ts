import type { CompleteUnitMovementEvent } from '@events';
import type { GameState, IssueCommandsPhaseState } from '@game';
import {
  getBoardSpace,
  getIssueCommandsPhaseState,
  getMovementResolutionState,
  hasEngagedUnits,
  hasSingleUnit,
  isAtPlacement,
  isSameUnitInstance,
} from '@queries';
import {
  addUnitToBoard,
  carryRidingCommander,
  moveUnitOnBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms/pureTransforms';
import { throwIfPending } from '@utils';

/**
 * Finishes a movement command-resolution slice:
 * ensures the mover is on the target hex. An engage move leaves the mover on
 * its starting hex until now, so that hex is cleared before the unit is placed
 * on the defender. Clears CRS back to `pending`, then either waits for the
 * next `moveUnit` or advances the issue-commands step when this player's
 * resolve queue is empty.
 *
 * Mirrors {@link applyCompleteRangedAttackCommandEvent} bookkeeping for movement.
 */
export function applyCompleteUnitMovementEvent<S extends GameState>(
  _event: CompleteUnitMovementEvent,
  state: S,
): S {
  const phaseState = getIssueCommandsPhaseState(state);
  const movementState = getMovementResolutionState(state);
  // A move is only completed once it has been written.
  const targetPlacement = throwIfPending(
    movementState.targetPlacement,
    'The move has not been written yet',
  );
  const targetPresence = getBoardSpace(
    state.boardState,
    targetPlacement.coordinate,
  ).unitPresence;
  const moverWithPlacement = movementState.movingUnit;
  const mover = moverWithPlacement.unit;
  const moverAlreadyPresent =
    (hasSingleUnit(targetPresence) &&
      isSameUnitInstance(targetPresence.unit, mover).result) ||
    (hasEngagedUnits(targetPresence) &&
      (isSameUnitInstance(targetPresence.primaryUnit, mover).result ||
        isSameUnitInstance(targetPresence.secondaryUnit, mover).result));
  // Still standing on the hex it started from. The move has not been applied.
  const stillOnStartingHex = isAtPlacement(
    state.boardState,
    moverWithPlacement,
  ).result;
  const leavingStartingHex = stillOnStartingHex && !moverAlreadyPresent;
  const arrival = {
    placement: targetPlacement,
    unit: mover,
  };
  // A front or flank engagement places the mover only now; a commander
  // riding with it comes off the start space with it (§4.3.10).
  // TODO(wrong): a mover that is neither on its start space nor already at
  // its destination is not on the board, and is set down from nowhere. This
  // looks unreachable (a rear engagement and open ground both place the mover
  // before the move completes); what would settle it is a spec that reaches
  // it, or a throw here.
  let boardWithUnit = state.boardState;
  if (leavingStartingHex) {
    boardWithUnit = moveUnitOnBoard(state.boardState, mover, targetPlacement);
  } else if (!moverAlreadyPresent) {
    boardWithUnit = addUnitToBoard(state.boardState, arrival);
  }
  const boardWithMover = leavingStartingHex
    ? carryRidingCommander(
        boardWithUnit,
        movementState,
        targetPlacement.coordinate,
      )
    : boardWithUnit;
  const stateWithMover =
    boardWithMover === state.boardState
      ? state
      : updateBoardState(state, boardWithMover);

  const clearedCrs: IssueCommandsPhaseState = {
    ...phaseState,
    currentCommandResolutionState: 'pending',
  };

  if (clearedCrs.step === 'firstPlayerResolveCommands') {
    if (clearedCrs.remainingUnitsFirstPlayer.length > 0) {
      return updatePhaseState(stateWithMover, clearedCrs);
    }
    return updatePhaseState(stateWithMover, {
      ...clearedCrs,
      remainingUnitsFirstPlayer: [],
      step: 'secondPlayerIssueCommands',
    });
  }

  if (clearedCrs.step === 'secondPlayerResolveCommands') {
    if (clearedCrs.remainingUnitsSecondPlayer.length > 0) {
      return updatePhaseState(stateWithMover, clearedCrs);
    }
    return updatePhaseState(stateWithMover, {
      ...clearedCrs,
      remainingUnitsSecondPlayer: [],
      step: 'complete',
    });
  }

  return updatePhaseState(stateWithMover, clearedCrs);
}
