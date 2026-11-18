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
  const cardsToDiscard = cardIds.map((cardId) =>
    throwIfUndefined(
      owned.inHand.find((card) => card.id === cardId),
      `Card ${cardId} is not in the hand`,
    ),
  );

  // The cards not named stay in hand, in the order they were held.
  const cardIdSet = new Set(cardIds);
  const cardsToKeep = owned.inHand.filter((card) => !cardIdSet.has(card.id));

  return {
    ...owned,
    discarded: [...owned.discarded, ...cardsToDiscard],
    inHand: cardsToKeep,
  };
}
