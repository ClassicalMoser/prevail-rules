import type { CompleteUnitMovementEvent } from '@events';
import type { GameState, IssueCommandsPhaseState } from '@game';
import { hasEngagedUnits, hasSingleUnit } from '@entities';
import {
  getBoardSpace,
  getIssueCommandsPhaseState,
  getMovementResolutionState,
  isSameUnitInstance,
} from '@queries';
import {
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms/pureTransforms';

/**
 * Finishes a movement command-resolution slice:
 * ensures the mover is on the target hex (needed after engage moves that kept
 * the defender alone during engagement resolution), clears CRS back to
 * `pending`, then either waits for the next `moveUnit` or advances the
 * issue-commands step when this player's resolve queue is empty.
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
  const mover = movementState.movingUnit.unit;
  const moverAlreadyPresent =
    (hasSingleUnit(targetPresence) &&
      isSameUnitInstance(targetPresence.unit, mover).result) ||
    (hasEngagedUnits(targetPresence) &&
      (isSameUnitInstance(targetPresence.primaryUnit, mover).result ||
        isSameUnitInstance(targetPresence.secondaryUnit, mover).result));

  const stateWithMover = moverAlreadyPresent
    ? state
    : updateBoardState(
        state,
        addUnitToBoard(state.boardState, {
          placement: targetPlacement,
          unit: mover,
        }),
      );

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
