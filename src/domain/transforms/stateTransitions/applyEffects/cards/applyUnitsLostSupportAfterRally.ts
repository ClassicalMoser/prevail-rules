import type { PlayerSide, UnitInstance } from '@entities';
import type { CleanupPhaseState, GameState, RoutState } from '@game';
import { createOpenedRoutState } from '@factories';
import {
  getCleanupPhaseState,
  getNextStepForResolveRally,
  getPlayerUnitsWithPlacementOnBoard,
  getRallyResolutionStateAwaitingUnitSupport,
  hasUnitInArray,
} from '@queries';
import {
  addUnitToRouted,
  removeUnitFromBoard,
  updateBoardState,
  updateCleanupStep,
  updateRallyResolutionState,
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
  const rallyState = getRallyResolutionStateAwaitingUnitSupport(state, player);
  const defaultNextStep = getNextStepForResolveRally(state);

  const playerUnits = getPlayerUnitsWithPlacementOnBoard(state, player);
  const unitsToRout = [...playerUnits].filter((unitWithPlacement) =>
    hasUnitInArray(uncoveredUnits, unitWithPlacement.unit),
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

  // Uncovered units always open a rout. The discard debt (possibly zero) is
  // filled by resolveRout; a zero penalty closes that substep without a choice.
  const routState: RoutState | 'pending' =
    unitsToRout.length > 0
      ? createOpenedRoutState(
          player,
          unitsToRout.map((u) => u.unit),
        )
      : 'pending';

  const updatedRallyState = {
    ...rallyState,
    routState,
    unitsLostSupport: unitsToRout.map((u) => u.unit),
  };

  // Stay on this step while a rout is open; otherwise advance cleanup.
  const finalNextStep: CleanupPhaseState['step'] =
    unitsToRout.length > 0 ? phaseState.step : defaultNextStep;

  const withRally = updateRallyResolutionState(
    newState,
    player,
    updatedRallyState,
  );
  const advanced = updateCleanupStep(withRally, finalNextStep);
  return advanced;
}
