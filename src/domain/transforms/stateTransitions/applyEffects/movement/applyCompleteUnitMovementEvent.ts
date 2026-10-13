import type { CompleteUnitMovementEvent } from '@events';
import type { GameState, IssueCommandsPhaseState } from '@game';
import { hasEngagedUnits, hasSingleUnit } from '@entities';
import {
  getBoardSpace,
  getIssueCommandsPhaseState,
  getMovementResolutionState,
  isAtPlacement,
  isSameUnitInstance,
} from '@queries';
import {
  addUnitToBoard,
  removeUnitFromBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms/pureTransforms';

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
  const targetPlacement = movementState.targetPlacement;
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
  const boardAfterLift = leavingStartingHex
    ? removeUnitFromBoard(state.boardState, moverWithPlacement)
    : state.boardState;
  const arrival = {
    placement: targetPlacement,
    unit: mover,
  };
  const boardWithMover = moverAlreadyPresent
    ? state.boardState
    : addUnitToBoard(boardAfterLift, arrival);
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
