import type { OwnedCardState } from '@game';
import { throwIfUndefined } from '@utils';

/**
 * Pure transform to move specified cards from hand to discarded pile.
 * Operates on a single player's owned card state.
 *
 * The cards lie on the pile in the order they are named, not the order they
 * were held: a seat that cannot see this hand lays the shown cards down in the
 * event's order, and every view of the pile must agree.
 *
 * A card leaves the hand for the discard pile when it is committed for +1
 * (§8.1) or paid for a rout's Morale (§9.3.2); both come back at the next
 * rally. The commitment applies and `applyChooseRoutDiscardEvent` call this
 * where the hand is in view; `discardShownCardFromHiddenHand` is the same
 * step where it is not.
 *
 * @param owned - The player's current owned card state
 * @param cardIds - The IDs of the cards to discard, in the order they are laid down
 * @returns A new owned card state with cards moved from hand to discarded
 * @throws If a named card is not in the hand
 */
export function discardCardsFromHand(
  owned: OwnedCardState,
  cardIds: string[],
): OwnedCardState {
  // Each named card is found in the hand; naming one the hand lacks is a
  // malformed call, not a discard to skip.
  // TODO(wrong): an id named twice finds the same card twice, so the card
  // lies on the discard pile twice while leaving the hand once: one card in
  // two places. Settle by throwing on a repeated id, as for a missing one.
  const cardsToDiscard = cardIds.map((cardId) =>
    throwIfUndefined(
      owned.inHand.find((card) => card.id === cardId),
      `Card ${cardId} is not in the hand`,
    ),
  );

  // The cards not named stay in hand, in the order they were held.
  const cardIdSet = new Set(cardIds);
  const cardsToKeep = owned.inHand.filter((card) => !cardIdSet.has(card.id));

  // The discarded cards go on top of those already there, which wait for the
  // same rally to return (§10.3.2).
  const discarded: OwnedCardState = {
    ...owned,
    discarded: [...owned.discarded, ...cardsToDiscard],
    inHand: cardsToKeep,
  };
  return discarded;
}
