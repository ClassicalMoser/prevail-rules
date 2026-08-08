import type { PlayerSide, UnitInstance } from '@entities';
import type { CleanupPhaseState, GameState, RoutState } from '@game';
import {
  getCleanupPhaseState,
  getNextStepForResolveRally,
  getPlayerUnitsWithPlacementOnBoard,
  getRallyResolutionStateAwaitingUnitsBroken,
  isSameUnitInstance,
} from '@queries';
import { updateRallyResolutionStateForCurrentStep } from '@transforms/pureTransforms/sequencing/updateRallyResolutionStateForCurrentStep';
import {
  addUnitToRouted,
  removeUnitFromBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms/pureTransforms';

/**
 * Routes uncovered (unsupported) units after rally support assignment:
 * removes them from the board, seeds rout discard when morale &gt; 0, and
 * either stays on the resolve-rally step or advances cleanup.
 */
export function applyUnitsLostSupportAfterRally<S extends GameState>(
  state: S,
  player: PlayerSide,
  uncoveredUnits: readonly UnitInstance[],
): S {
  const phaseState = getCleanupPhaseState(state);
  const rallyState = getRallyResolutionStateAwaitingUnitsBroken(state, player);
  const defaultNextStep = getNextStepForResolveRally(state);

  const playerUnits = getPlayerUnitsWithPlacementOnBoard(state, player);
  const unitsToRout = [...playerUnits].filter((unitWithPlacement) =>
    uncoveredUnits.some(
      (uncovered) =>
        isSameUnitInstance(uncovered, unitWithPlacement.unit).result,
    ),
  );

  let newState = state;
  for (const unitWithPlacement of unitsToRout) {
    const newBoardState = removeUnitFromBoard(
      newState.boardState,
      unitWithPlacement,
    );
    newState = updateBoardState(newState, newBoardState);
    newState = addUnitToRouted(newState, unitWithPlacement.unit);
  }

  const totalPenalty = unitsToRout.reduce(
    (sum, unitWithPlacement) => sum + unitWithPlacement.unit.unitType.morale,
    0,
  );

  const routState: RoutState | 'pending' =
    totalPenalty > 0
      ? ({
          cardsChosen: false,
          completed: false,
          numberToDiscard: totalPenalty,
          player,
          substepType: 'rout' as const,
          unitsToRout: unitsToRout.map((u) => u.unit),
        } satisfies RoutState)
      : 'pending';

  const updatedRallyState = {
    ...rallyState,
    routState,
    unitsLostSupport: unitsToRout.map((u) => u.unit),
  };

  const finalNextStep: CleanupPhaseState['step'] =
    totalPenalty > 0 ? phaseState.step : defaultNextStep;

  const newPhaseState = updateRallyResolutionStateForCurrentStep(
    phaseState,
    updatedRallyState,
    finalNextStep,
  );

  return updatePhaseState(newState, newPhaseState);
}
