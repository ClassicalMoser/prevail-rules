import type { ChooseRoutDiscardEvent } from '@events';
import type { GameState } from '@game';
import {
  getRoutState,
  getOwnedPlayerCardState,
  getRearEngagementStateFromMovement,
} from '@queries';
import {
  discardCardsFromHand,
  replaceOwnedPlayerCardState,
  updateEngagementStateInMovement,
  updateRoutState,
} from '@transforms/pureTransforms';

/**
 * Applies a ChooseRoutDiscardEvent:
 * - discards the chosen hand cards
 * - marks the active rout slice cardsChosen + completed
 * - for rear engagement, marks the engagement complete so movement can finish
 *
 * Routed units already left the board when the rout opened. This event only
 * settles the discard debt and closes the substep.
 *
 * Event is assumed pre-validated via {@link isValidChooseRoutDiscardEvent}.
 * Requires `event.player` to be owned under the state's visibility
 * ({@link getOwnedPlayerCardState} / {@link replaceOwnedPlayerCardState}).
 */
export function applyChooseRoutDiscardEvent<S extends GameState>(
  event: ChooseRoutDiscardEvent,
  state: S,
): S {
  // The event names the player, and in a melee each side can be routing.
  const routState = getRoutState(state, event.player);

  const owned = getOwnedPlayerCardState(state.cardState, event.player);
  const discardedCardState = discardCardsFromHand(owned, event.cardIds);
  let next: S = {
    ...state,
    cardState: replaceOwnedPlayerCardState(
      state.cardState,
      event.player,
      discardedCardState,
    ),
  };

  const completedRout = {
    ...routState,
    cardsChosen: true,
    completed: true,
  };
  next = updateRoutState(next, completedRout);

  try {
    const engagement = getRearEngagementStateFromMovement(next);
    next = updateEngagementStateInMovement(next, {
      ...engagement,
      completed: true,
      engagementResolutionState: {
        ...engagement.engagementResolutionState,
        completed: true,
        routState: completedRout,
      },
    });
  } catch {
    // Not a rear-engagement rout parent (rally / attack apply / melee).
  }

  return next;
}
