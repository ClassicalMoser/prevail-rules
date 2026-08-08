import type { ChooseRoutDiscardEvent } from '@events';
import type { GameState, OwnedPlayerForGameState } from '@game';
import {
  getAwaitingRoutDiscardState,
  getOwnedPlayerCardState,
  getPositionOfUnit,
  getRearEngagementStateFromMovement,
  hasUnitInArray,
} from '@queries';
import {
  addUnitToRouted,
  discardCardsFromHand,
  removeUnitFromBoard,
  updateBoardState,
  updateEngagementStateInMovement,
  updatePlayerCardState,
  updateRoutState,
} from '@transforms/pureTransforms';

/**
 * Applies a ChooseRoutDiscardEvent:
 * - discards the chosen hand cards
 * - marks the active rout slice cardsChosen + completed
 * - removes routed units from the board into `routedUnits`
 * - for rear engagement, marks the engagement complete so movement can finish
 *
 * Event is assumed pre-validated via {@link isValidChooseRoutDiscardEvent}.
 */
export function applyChooseRoutDiscardEvent<S extends GameState>(
  event: ChooseRoutDiscardEvent,
  state: S,
): S {
  const routState = getAwaitingRoutDiscardState(state);
  if (routState === null) {
    throw new Error('No rout discard awaiting choice');
  }

  const owned = getOwnedPlayerCardState(state.cardState, event.player);
  const discardedCardState = discardCardsFromHand(owned, event.cardIds);
  let next = updatePlayerCardState(
    state,
    event.player as OwnedPlayerForGameState<S>,
    discardedCardState,
  );

  const completedRout = {
    ...routState,
    cardsChosen: true,
    completed: true,
  };
  next = updateRoutState(next, completedRout);

  for (const unit of routState.unitsToRout) {
    try {
      const placement = getPositionOfUnit(next.boardState, unit);
      next = updateBoardState(
        next,
        removeUnitFromBoard(next.boardState, { placement, unit }),
      );
    } catch {
      // Already off the board (some parents remove before discard).
    }
    if (!hasUnitInArray(next.routedUnits, unit)) {
      next = addUnitToRouted(next, unit);
    }
  }

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
