import type { OpenRetreatFromEngagementEvent } from '@events';
import type { GameState } from '@game';
import { createOpenedRetreatState } from '@factories';
import {
  getFrontEngagementStateFromMovement,
  getSingleUnitWithPlacementAtCoordinate,
} from '@queries';
import { updateFrontEngagementResolutionState } from '@transforms/pureTransforms';

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

  // A defender with nowhere to fall back to stands, and no retreat opens
  // for that defender (§6.3.2, §9.1.5), so a retreat is recorded with at least one
  // way back.
  if (event.retreatPaths.length === 0) {
    throw new Error(
      'A defender with nowhere to retreat stands; no retreat opens',
    );
  }

  // The procedure worked out the legal retreats; they are written as given.
  const retreatState = createOpenedRetreatState(
    retreatingUnit,
    event.retreatPaths,
  );

  const opened = updateFrontEngagementResolutionState(state, { retreatState });
  return opened;
}
