import type { ChooseRoutDiscardEvent } from '@events';
import type { GameState } from '@game';
import {
  findOwnedPlayerCardState,
  getHiddenPlayerCardState,
  getRoutState,
} from '@queries';
import {
  closeRearEngagementWhenRouted,
  discardCardsFromHand,
  discardShownCardFromHiddenHand,
  replaceHiddenPlayerCardState,
  replaceOwnedPlayerCardState,
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
 *
 * The fold follows the shape of the hand it reads. Where the hand is in view
 * the cards leave it by id. Where it is not — an opponent's seat, or a
 * spectator's — the discard is still face up, so one hidden card leaves the
 * hand for each card shown, and the shown cards lie on the discard pile.
 * Neither shape is a fault.
 */
export function applyChooseRoutDiscardEvent<S extends GameState>(
  event: ChooseRoutDiscardEvent,
  state: S,
): S {
  // The event names the player, and in a melee each side can be routing.
  const routState = getRoutState(state, event.player);

  const owned = findOwnedPlayerCardState(state.cardState, event.player);
  let next: S;
  if (owned === undefined) {
    const hidden = getHiddenPlayerCardState(state.cardState, event.player);
    let discardedHidden = hidden;
    for (const shown of event.cards) {
      discardedHidden = discardShownCardFromHiddenHand(discardedHidden, shown);
    }
    next = {
      ...state,
      cardState: replaceHiddenPlayerCardState(
        state.cardState,
        event.player,
        discardedHidden,
      ),
    };
  } else {
    const cardIds = event.cards.map((card) => card.id);
    next = {
      ...state,
      cardState: replaceOwnedPlayerCardState(
        state.cardState,
        event.player,
        discardCardsFromHand(owned, cardIds),
      ),
    };
  }

  const completedRout = {
    ...routState,
    cardsChosen: true,
    completed: true,
  };
  next = updateRoutState(next, completedRout);

  // A rear engagement is nothing but this rout; paying it ends the engagement.
  next = closeRearEngagementWhenRouted(next);

  return next;
}
