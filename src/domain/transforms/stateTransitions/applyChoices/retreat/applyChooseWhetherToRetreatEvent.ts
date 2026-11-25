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
 *
 * @param event - The defender's answer: fall back, or stand
 * @param state - The game, with a front engagement offering the defender a retreat
 * @returns The game with the answer recorded, and the engagement complete if it stands
 * @throws Error when the order under way is not a move, or its engagement is
 * not from the front
 */
export function applyChooseWhetherToRetreatEvent<S extends GameState>(
  event: ChooseWhetherToRetreatEvent,
  state: S,
): S {
  // Standing its ground ends the engagement here; the melee comes later.
  if (!event.choosesToRetreat) {
    // A defender that stands will never fall back from this engagement, so
    // its retreat is bypassed rather than left owing.
    const declined = updateFrontEngagementResolutionState(state, {
      defendingUnitRetreats: false,
      retreatState: 'bypassed',
    });

    // Both units stay locked in the space and fight in Phase 4 (§6.3.2 step 4).
    const stood = completeEngagementInMovement(declined);

    // The game, ready for the move to finish.
    return stood;
  }

  // Falling back: the retreat opens next, once its options are worked out.
  const retreating = updateFrontEngagementResolutionState(state, {
    defendingUnitRetreats: true,
  });

  // The game, waiting for the retreat to be opened.
  return retreating;
}
