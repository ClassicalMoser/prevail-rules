import type { ValidationResult } from '@utils';
import type { ChooseRoutDiscardEvent } from '@events';
import type { GameState } from '@game';
import { getLegalRoutDiscardCards } from '@legality';
import { findOwnedPlayerCardState, isSameCardValue } from '@queries';

/**
 * Validates a ChooseRoutDiscardEvent as an integral commit over atomic legal
 * discard cards from {@link getLegalRoutDiscardCards}:
 * - discard must be expected for this player
 * - exactly `numberToDiscard` unique card IDs
 * - every ID is among the legal hand atoms
 * - every card shown is the card the hand holds with that ID
 */
export function isValidChooseRoutDiscardEvent(
  event: ChooseRoutDiscardEvent,
  state: GameState,
): ValidationResult {
  // The rout owing a discard: whose unit routed, how many cards its Morale
  // costs, and the cards in that player's hand (§9.3.2).
  const legal = getLegalRoutDiscardCards(state);

  // The owner of the routed unit pays for it (§9.3.2). The expected check
  // refuses anyone else first; this keeps the validator whole when it is
  // asked directly.
  if (event.player !== legal.player) {
    const wrongPlayer: ValidationResult = {
      errorReason: `Expected rout discard from ${legal.player}, got ${event.player}`,
      result: false,
    };
    return wrongPlayer;
  }

  // The discard is exactly the Morale owed, summed when several units rout
  // at once (§9.3.3): no fewer, and no more.
  const chosenIds = event.cards.map((card) => card.id);
  if (chosenIds.length !== legal.numberToDiscard) {
    const wrongCount: ValidationResult = {
      errorReason: `Expected ${legal.numberToDiscard} cards, got ${chosenIds.length}`,
      result: false,
    };
    return wrongCount;
  }

  // Each card is one card (§3.1.5), so naming it twice would pay one card
  // for two.
  const uniqueIds = new Set(chosenIds);
  if (uniqueIds.size !== chosenIds.length) {
    const repeated: ValidationResult = {
      errorReason: 'Duplicate card IDs in discard selection',
      result: false,
    };
    return repeated;
  }

  // The cards are chosen freely, but only from the hand (§9.3.2): not from
  // the card in play, the piles, or anywhere else.
  const legalIds = new Set(legal.cardIds);
  for (const cardId of chosenIds) {
    if (!legalIds.has(cardId)) {
      const notInHand: ValidationResult = {
        errorReason: `Command card ${cardId} is not a legal discard for ${event.player}`,
        result: false,
      };
      return notInHand;
    }
  }

  // Each id names a card the player holds; the card the event shows must be
  // that card, since every seat folds the discard as shown.
  // TODO(composition): the legal options carry only ids, so this reads the
  // hand a second time, and its two soft guards (`?.` and `held !==
  // undefined`) catch nothing in play: every id passed the hand check above,
  // and a hand this view cannot see offered no ids, so only an empty discard
  // gets here without one. Settled by having `getLegalRoutDiscardCards` offer
  // the hand's cards, as `getLegalChooseCardOptions` does, and comparing
  // against those.
  const hand = findOwnedPlayerCardState(state.cardState, event.player)?.inHand;
  for (const shown of event.cards) {
    const held = hand?.find((card) => card.id === shown.id);
    if (held !== undefined) {
      // The reason names the first part of the card that was altered.
      const sameCard = isSameCardValue(held, shown);
      if (!sameCard.result) {
        return sameCard;
      }
    }
  }

  // The Morale owed, paid in distinct cards from the owner's own hand.
  const valid: ValidationResult = { result: true };
  return valid;
}
