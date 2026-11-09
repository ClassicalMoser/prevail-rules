import type { MoveDelta } from '@entities';
import type { ChooseWhetherToRetreatEvent } from '@events';
import type { GameState, RetreatState } from '@game';
import { getLegalRetreats } from '@legality';
import {
  getFrontEngagementStateFromMovement,
  getSingleUnitWithPlacementAtCoordinate,
} from '@queries';
import { updateEngagementStateInMovement } from '@transforms/pureTransforms';

/**
 * Applies a ChooseWhetherToRetreatEvent to the game state.
 * Updates the defendingUnitRetreats flag in the front engagement resolution state.
 *
 * Accepting retreat opens a nested {@link RetreatState} with
 * `legalRetreatPaths` baked from {@link getLegalRetreats} (same pattern as
 * attack-apply). Declining completes the engagement (units stay for melee).
 *
 * Event is assumed pre-validated (issueCommands phase, movement with front engagement).
 */
export function applyChooseWhetherToRetreatEvent<S extends GameState>(
  event: ChooseWhetherToRetreatEvent,
  state: S,
): S {
  const engagementState = getFrontEngagementStateFromMovement(state);

  if (!event.choosesToRetreat) {
    return updateEngagementStateInMovement(state, {
      ...engagementState,
      completed: true,
      engagementResolutionState: {
        ...engagementState.engagementResolutionState,
        defendingUnitRetreats: false,
      },
    });
  }

  const retreatingUnit = getSingleUnitWithPlacementAtCoordinate(
    state.boardState,
    engagementState.targetPlacement.coordinate,
  );
  const legalRetreatPaths = getLegalRetreats(retreatingUnit, state);
  const chosenRetreatPath: MoveDelta[] | 'pending' =
    legalRetreatPaths.length === 1 ? legalRetreatPaths[0] : 'pending';

  // A retreat with somewhere to go will never rout, so that slot is bypassed.
  // Nowhere to go leaves the rout pending until triggerRoutFromRetreat opens it.
  const nestedRoutState: 'pending' | 'bypassed' =
    legalRetreatPaths.length === 0 ? 'pending' : 'bypassed';

  const retreatState: RetreatState = {
    completed: false,
    chosenRetreatPath,
    legalRetreatPaths,
    retreatingUnit,
    routState: nestedRoutState,
    substepType: 'retreat',
  };

  return updateEngagementStateInMovement(state, {
    ...engagementState,
    engagementResolutionState: {
      ...engagementState.engagementResolutionState,
      defendingUnitRetreats: true,
      retreatState,
    },
  });
}
