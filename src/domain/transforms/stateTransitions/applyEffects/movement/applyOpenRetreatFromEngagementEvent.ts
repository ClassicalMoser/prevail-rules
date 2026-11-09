import type { MoveDelta } from '@entities';
import type { OpenRetreatFromEngagementEvent } from '@events';
import type { GameState, RetreatState } from '@game';
import {
  getFrontEngagementStateFromMovement,
  getSingleUnitWithPlacementAtCoordinate,
} from '@queries';
import { updateEngagementStateInMovement } from '@transforms/pureTransforms';

/**
 * Applies an OpenRetreatFromEngagementEvent: the retreat of a defender that
 * chose to fall back from a front engagement (§6.3.2) is opened, with the
 * retreats its procedure recorded on the event.
 *
 * Event is assumed pre-validated (a front engagement whose defender chose to
 * retreat, and whose retreat is not yet open).
 *
 * @param event - The legal retreats, as the procedure found them
 * @param state - The current game state
 * @returns A new game state with the defender's retreat open
 */
export function applyOpenRetreatFromEngagementEvent<S extends GameState>(
  event: OpenRetreatFromEngagementEvent,
  state: S,
): S {
  const engagementState = getFrontEngagementStateFromMovement(state);

  // The defender still stands in the space it was engaged in.
  const retreatingUnit = getSingleUnitWithPlacementAtCoordinate(
    state.boardState,
    engagementState.targetPlacement.coordinate,
  );

  // One legal retreat is not a choice — it is carried out as it stands.
  const legalRetreatPaths = event.retreatPaths;
  const chosenRetreatPath: MoveDelta[] | 'pending' =
    legalRetreatPaths.length === 1 ? legalRetreatPaths[0] : 'pending';

  // A retreat with somewhere to go will never rout, so that slot is bypassed.
  // Nowhere to go leaves the rout pending until triggerRoutFromRetreat opens it.
  const nestedRoutState: 'pending' | 'bypassed' =
    legalRetreatPaths.length === 0 ? 'pending' : 'bypassed';

  const retreatState: RetreatState = {
    chosenRetreatPath,
    completed: false,
    legalRetreatPaths,
    retreatingUnit,
    routState: nestedRoutState,
    substepType: 'retreat',
  };

  const opened = updateEngagementStateInMovement(state, {
    ...engagementState,
    engagementResolutionState: {
      ...engagementState.engagementResolutionState,
      retreatState,
    },
  });
  return opened;
}
