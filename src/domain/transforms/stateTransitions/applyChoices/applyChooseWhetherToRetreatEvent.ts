import type { ChooseWhetherToRetreatEvent } from '@events';
import type { GameState } from '@game';
import {
  completeEngagementInMovement,
  updateFrontEngagementResolutionState,
} from '@transforms/pureTransforms';

/**
 * Applies a ChooseWhetherToRetreatEvent: the defender engaged from the front,
 * and fast enough to get away, says whether it falls back (§6.3.2).
 *
 * Declining completes the engagement: the two units stay locked together for
 * the melee. Accepting only records the choice; the retreat itself is opened
 * by `openRetreatFromEngagement`, whose procedure works out where the unit
 * may go.
 *
 * Event is assumed pre-validated (issueCommands phase, movement with front engagement).
 */
export function applyChooseWhetherToRetreatEvent<S extends GameState>(
  event: ChooseWhetherToRetreatEvent,
  state: S,
): S {
  // Standing its ground ends the engagement here; the melee comes later.
  if (!event.choosesToRetreat) {
    const stood = completeEngagementInMovement(
      updateFrontEngagementResolutionState(state, {
        defendingUnitRetreats: false,
      }),
    );
    return stood;
  }

  // Falling back: the retreat opens next, once its options are worked out.
  const retreating = updateFrontEngagementResolutionState(state, {
    defendingUnitRetreats: true,
  });
  return retreating;
}
