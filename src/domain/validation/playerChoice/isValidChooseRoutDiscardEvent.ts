import type { Board, GameState, ValidationResult } from '@entities';
import type { ChooseRoutDiscardEvent } from '@events';
import { getOtherPlayer } from '@queries';
import {
  getCleanupPhaseState,
  getCurrentRallyResolutionState,
} from '@queries/sequencing';

/**
 * Validates a ChooseRoutDiscardEvent.
 * Checks that the player matches, cards exist in hand, and count matches penalty.
 *
 * @param event - The choose rout discard event to validate
 * @param state - The current game state
 * @returns Validation result
 */
export function isValidChooseRoutDiscardEvent<TBoard extends Board>(
  event: ChooseRoutDiscardEvent<TBoard>,
  state: GameState<TBoard>,
): ValidationResult {
  try {
    const { player, cardIds } = event;

    // getCleanupPhaseState throws if not in cleanup phase
    const phaseState = getCleanupPhaseState(state);
    const firstPlayer = state.currentInitiative;
    const secondPlayer = getOtherPlayer(firstPlayer);

    // Check we're on a resolveRally step and player matches
    if (phaseState.step === 'firstPlayerResolveRally') {
      if (player !== firstPlayer) {
        return {
          result: false,
          errorReason: `Expected ${firstPlayer} (first player) for discard, got ${player}`,
        };
      }
    } else if (phaseState.step === 'secondPlayerResolveRally') {
      if (player !== secondPlayer) {
        return {
          result: false,
          errorReason: `Expected ${secondPlayer} (second player) for discard, got ${player}`,
        };
      }
    } else {
      return {
        result: false,
        errorReason: `Cleanup phase is not on a resolveRally step: ${phaseState.step}`,
      };
    }

    // Get rally state using shared sequencing query
    const rallyState = getCurrentRallyResolutionState(state);

    if (!rallyState.routState) {
      return {
        result: false,
        errorReason: 'No rout state found',
      };
    }

    if (rallyState.routState.cardsChosen) {
      return {
        result: false,
        errorReason: 'Rout discards already chosen',
      };
    }

    // Validate number of cards
    const expectedCount = rallyState.routState.numberToDiscard;
    if (cardIds.length !== expectedCount) {
      return {
        result: false,
        errorReason: `Expected ${expectedCount} cards, got ${cardIds.length}`,
      };
    }

    // Validate all cards exist in player's hand
    const playerCardState = state.cardState[event.player];
    const cardsInHand = playerCardState.inHand;
    const handCardIds = new Set(cardsInHand.map((card) => card.id));

    for (const cardId of cardIds) {
      if (!handCardIds.has(cardId)) {
        return {
          result: false,
          errorReason: `Card ${cardId} not found in ${player}'s hand`,
        };
      }
    }

    // Validate no duplicate card IDs
    const uniqueCardIds = new Set(cardIds);
    if (uniqueCardIds.size !== cardIds.length) {
      return {
        result: false,
        errorReason: 'Duplicate card IDs in discard selection',
      };
    }

    return { result: true };
  } catch (error) {
    return {
      result: false,
      errorReason: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
