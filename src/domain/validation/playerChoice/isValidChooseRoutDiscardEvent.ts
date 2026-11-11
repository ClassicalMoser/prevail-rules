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
  try {
    const legal = getLegalRoutDiscardCards(state);
    if (legal === null) {
      return {
        errorReason: 'Rout discard is not expected in the current state',
        result: false,
      };
    }

    if (event.player !== legal.player) {
      return {
        errorReason: `Expected rout discard from ${legal.player}, got ${event.player}`,
        result: false,
      };
    }

    const chosenIds = event.cards.map((card) => card.id);
    if (chosenIds.length !== legal.numberToDiscard) {
      return {
        errorReason: `Expected ${legal.numberToDiscard} cards, got ${chosenIds.length}`,
        result: false,
      };
    }

    const uniqueIds = new Set(chosenIds);
    if (uniqueIds.size !== chosenIds.length) {
      return {
        errorReason: 'Duplicate card IDs in discard selection',
        result: false,
      };
    }

    const legalIds = new Set(legal.cardIds);
    for (const cardId of chosenIds) {
      if (!legalIds.has(cardId)) {
        return {
          errorReason: `Command card ${cardId} is not a legal discard for ${event.player}`,
          result: false,
        };
      }
    }

    // Each id names a card the player holds; the card the event shows must be
    // that card, since every seat folds the discard as shown.
    const hand = findOwnedPlayerCardState(
      state.cardState,
      event.player,
    )?.inHand;
    for (const shown of event.cards) {
      const held = hand?.find((card) => card.id === shown.id);
      if (held !== undefined) {
        const sameCard = isSameCardValue(held, shown);
        if (!sameCard.result) {
          return sameCard;
        }
      }
    }

    return { result: true };
  } catch (error) {
    return {
      errorReason: error instanceof Error ? error.message : 'Unknown error',
      result: false,
    };
  }
}
