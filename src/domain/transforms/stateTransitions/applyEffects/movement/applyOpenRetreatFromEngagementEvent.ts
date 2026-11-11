import type { OpenRetreatFromEngagementEvent } from '@events';
import type { GameState } from '@game';
import { createOpenedRetreatState } from '@factories';
import {
  getFrontEngagementStateFromMovement,
  getSingleUnitWithPlacementAtCoordinate,
} from '@queries';
import { throwIfPending } from '@utils';
import { updateFrontEngagementResolutionState } from '@transforms/pureTransforms';

/**
 * Applies an OpenRetreatFromEngagementEvent: the retreat of a defender that
 * chose to fall back from a front engagement (§6.3.2) is opened, with the
 * retreats the engagement recorded when it worked out the retreat option.
 *
 * Event is assumed pre-validated (a front engagement whose defender chose to
 * retreat, and whose retreat is not yet open).
 *
 * @param _event - The event carries nothing; the paths are the engagement's
 * @param state - The current game state
 * @returns A new game state with the defender's retreat open
 */
export function applyOpenRetreatFromEngagementEvent<S extends GameState>(
  _event: OpenRetreatFromEngagementEvent,
  state: S,
): S {
  const engagementState = getFrontEngagementStateFromMovement(state);

  // The defender still stands in the space it was engaged in.
  const retreatingUnit = getSingleUnitWithPlacementAtCoordinate(
    state.boardState,
    engagementState.targetPlacement.coordinate,
  );

  // The retreats were worked out when the retreat option was resolved. A
  // defender with nowhere to fall back to stands, and no retreat opens for
  // that defender (§6.3.2, §9.1.5), so one is opened only with a way back.
  const retreatPaths = throwIfPending(
    engagementState.engagementResolutionState.retreatPaths,
    'The retreat option has not been resolved yet',
  );
  if (retreatPaths.length === 0) {
    throw new Error(
      'A defender with nowhere to retreat stands; no retreat opens',
    );
  }

  // The retreats are written as the engagement recorded them.
  const retreatState = createOpenedRetreatState(retreatingUnit, retreatPaths);

  const opened = updateFrontEngagementResolutionState(state, { retreatState });
  return opened;
}
