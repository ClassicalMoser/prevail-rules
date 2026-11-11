import type { ChooseRoutDiscardEvent } from '@events';
import type { GameState } from '@game';
import { getRoutState } from '@queries';
import {
  discardCardsFromHand,
  discardShownCardFromHiddenHand,
  updatePlayerCards,
  settleRout,
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

  // The cards leave the hand as the seat holds them: shown where it can see
  // the hand, counted where it cannot (§4.1.2).
  const cardIds = event.cards.map((card) => card.id);
  let next = updatePlayerCards(state, event.player, {
    hidden: (hidden) =>
      event.cards.reduce(discardShownCardFromHiddenHand, hidden),
    owned: (owned) => discardCardsFromHand(owned, cardIds),
  });

  const completedRout = {
    ...routState,
    cardsChosen: true,
    completed: true,
  };
  // Paying settles the rout, and whatever it held open closes with it.
  next = settleRout(next, completedRout);

  return next;
}
