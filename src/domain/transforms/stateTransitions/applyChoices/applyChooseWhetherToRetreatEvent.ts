import type { UnitPlacement } from '@entities';
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
 * `legalRetreatOptions` baked from {@link getLegalRetreats} (same pattern as
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
        defendingUnitRetreated: false,
        defendingUnitRetreats: false,
      },
    });
  }

  const retreatingUnit = getSingleUnitWithPlacementAtCoordinate(
    state.boardState,
    engagementState.targetPlacement.coordinate,
  );
  const legalRetreatOptions: UnitPlacement[] = [
    ...getLegalRetreats(retreatingUnit, state),
  ];
  const finalPosition: UnitPlacement | 'pending' =
    legalRetreatOptions.length === 1 ? legalRetreatOptions[0] : 'pending';

  const retreatState: RetreatState = {
    completed: false,
    finalPosition,
    legalRetreatOptions,
    retreatingUnit,
    routState: 'pending',
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
