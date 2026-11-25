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
 * - settles the rout through settleRout, which closes what it held open: a
 *   rear engagement (so movement can finish), a retreat, or a rally
 *
 * Routed units already left the board when the rout opened. This event only
 * settles the discard debt and closes the substep.
 *
 * Event is assumed pre-validated via `isValidChooseRoutDiscardEvent`.
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
  // The Morale is paid in cards the owner chooses freely from the hand, and
  // they go to the discard pile until the next rally (§9.3.2, §10.2).
  const cardIds = event.cards.map((card) => card.id);
  const paid = updatePlayerCards(state, event.player, {
    hidden: (hidden) =>
      event.cards.reduce(discardShownCardFromHiddenHand, hidden),
    owned: (owned) => discardCardsFromHand(owned, cardIds),
  });

  // The debt is chosen and paid, so the rout is over. A debt the hand could
  // not survive (§11.2) ended the game before this choice was asked for
  // (`findWinnerFromUnpayableRoutDiscard`), so this one always leaves a hand.
  const completedRout = {
    ...routState,
    cardsChosen: true,
    completed: true,
  };
  // Paying settles the rout, and whatever it held open closes with it.
  const settled = settleRout(paid, completedRout);

  // A retreat that fell into the rout, a rear engagement, or a rally is closed;
  // a rout from a shot or a melee waits on its attack's own close.
  return settled;
}
