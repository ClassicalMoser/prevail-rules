import type { ValidationResult } from '@utils';
import type { ChooseRoutDiscardEvent } from '@events';
import type { GameState } from '@game';
import { getLegalRoutDiscardCards } from '@legality';

/**
 * Validates a ChooseRoutDiscardEvent as an integral commit over atomic legal
 * discard cards from {@link getLegalRoutDiscardCards}:
 * - discard must be expected for this player
 * - exactly `numberToDiscard` unique card IDs
 * - every ID is among the legal hand atoms
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

    return { result: true };
  } catch (error) {
    return {
      errorReason: error instanceof Error ? error.message : 'Unknown error',
      result: false,
    };
  }
}
