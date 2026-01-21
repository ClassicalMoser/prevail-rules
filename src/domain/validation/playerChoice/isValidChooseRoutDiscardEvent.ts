import type { Board, GameState, ValidationResult } from '@entities';
import type { ChooseRoutDiscardEvent } from '@events';

import { getOtherPlayer } from '@queries';

/**
 * Validates a ChooseRoutDiscardEvent.
 * Checks that the player matches, cards exist in hand, and count matches penalty.
 *
 * @param event - The choose rout discard event to validate
 * @param state - The current game state
 * @returns Validation result
 */
export function isValidChooseRoutDiscardEvent<TBoard extends Board>(
  event: ChooseRoutDiscardEvent,
  state: GameState<TBoard>,
): ValidationResult {
  const { player, cardIds } = event;
  const currentPhaseState = state.currentRoundState.currentPhaseState;

  if (!currentPhaseState || currentPhaseState.phase !== 'cleanup') {
    return {
      result: false,
      errorReason: 'Current phase is not cleanup',
    };
  }

  // Determine which rally resolution we're in
  const firstPlayer = state.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);
  let rallyState;

  if (currentPhaseState.step === 'firstPlayerResolveRally') {
    if (player !== firstPlayer) {
      return {
        result: false,
        errorReason: `Expected ${firstPlayer} (first player) for discard, got ${player}`,
      };
    }
    rallyState = currentPhaseState.firstPlayerRallyResolutionState;
  } else if (currentPhaseState.step === 'secondPlayerResolveRally') {
    if (player !== secondPlayer) {
      return {
        result: false,
        errorReason: `Expected ${secondPlayer} (second player) for discard, got ${player}`,
      };
    }
    rallyState = currentPhaseState.secondPlayerRallyResolutionState;
  } else {
    return {
      result: false,
      errorReason: `Cleanup phase is not on a resolveRally step: ${currentPhaseState.step}`,
    };
  }

  if (!rallyState) {
    return {
      result: false,
      errorReason: 'Rally resolution state not found',
    };
  }

  if (!rallyState.routDiscardState) {
    return {
      result: false,
      errorReason: 'No rout discard penalty state found',
    };
  }

  if (rallyState.routDiscardState.cardsChosen) {
    return {
      result: false,
      errorReason: 'Rout discard cards already chosen',
    };
  }

  // Validate number of cards
  const expectedCount = rallyState.routDiscardState.numberToDiscard;
  if (cardIds.length !== expectedCount) {
    return {
      result: false,
      errorReason: `Expected ${expectedCount} cards, got ${cardIds.length}`,
    };
  }

  // Validate all cards exist in player's hand
  const playerCardState = state.cardState[player];
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
}
