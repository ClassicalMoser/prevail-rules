import type { OwnedCardState } from '@game';

/**
 * Returns all played and discarded cards to the player's hand.
 * Pure function operating on a single player's owned card state.
 *
 * A rally takes every card left in the played pile, once one is burnt, and
 * the entire discard pile back into hand (§10.3.2). `applyResolveRallyEvent`
 * calls it after `burnCardFromPlayed`, where the hand is in view.
 *
 * @param owned - The player's current owned card state
 * @returns New owned card state with played and discarded cards returned to hand
 */
export function returnCardsToHand(owned: OwnedCardState): OwnedCardState {
  // The cards come back after those still held: first the played pile, then
  // the discards.
  const newHand = [...owned.inHand, ...owned.played, ...owned.discarded];

  // Both piles are empty after a rally; the burnt pile never returns.
  const returned: OwnedCardState = {
    ...owned,
    discarded: [],
    inHand: newHand,
    played: [],
  };
  return returned;
}
