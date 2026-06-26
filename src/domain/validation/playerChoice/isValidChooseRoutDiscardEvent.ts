import type { Board, ValidationResult } from '@entities';
import type { ChooseRoutDiscardEvent } from '@events';
import type { GameStateForBoard } from '@game';

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
  state: GameStateForBoard<TBoard>,
): ValidationResult {
  const { player, cardIds } = event;
  const { currentPhaseState } = state.currentRoundState;

  if (currentPhaseState === 'none' || currentPhaseState.phase !== 'cleanup') {
    return {
      errorReason: 'Current phase is not cleanup',
      result: false,
    };
  }

  // Determine which rally resolution we're in
  const firstPlayer = state.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);
  let rallyState;

  if (currentPhaseState.step === 'firstPlayerResolveRally') {
    if (player !== firstPlayer) {
      return {
        errorReason: `Expected ${firstPlayer} (first player) for discard, got ${player}`,
        result: false,
      };
    }
    rallyState = currentPhaseState.firstPlayerRallyResolutionState;
  } else if (currentPhaseState.step === 'secondPlayerResolveRally') {
    if (player !== secondPlayer) {
      return {
        errorReason: `Expected ${secondPlayer} (second player) for discard, got ${player}`,
        result: false,
      };
    }
    rallyState = currentPhaseState.secondPlayerRallyResolutionState;
  } else {
    return {
      errorReason: `Cleanup phase is not on a resolveRally step: ${currentPhaseState.step}`,
      result: false,
    };
  }

  if (rallyState === 'pending') {
    return {
      errorReason: 'Rally resolution state not found',
      result: false,
    };
  }

  if (rallyState.routState === 'pending') {
    return {
      errorReason: 'No rout state found',
      result: false,
    };
  }

  if (rallyState.routState.cardsChosen) {
    return {
      errorReason: 'Rout discards already chosen',
      result: false,
    };
  }

  // Validate number of cards
  const expectedCount = rallyState.routState.numberToDiscard;
  if (cardIds.length !== expectedCount) {
    return {
      errorReason: `Expected ${expectedCount} cards, got ${cardIds.length}`,
      result: false,
    };
  }

  // Validate all cards exist in player's hand
  const playerCardState = state.cardState[event.player];
  const cardsInHand = playerCardState.inHand;
  const handCardIds = new Set(cardsInHand.map((card) => card.id));

  for (const cardId of cardIds) {
    if (!handCardIds.has(cardId)) {
      return {
        errorReason: `Card ${cardId} not found in ${player}'s hand`,
        result: false,
      };
    }
  }

  // Validate no duplicate card IDs
  const uniqueCardIds = new Set(cardIds);
  if (uniqueCardIds.size !== cardIds.length) {
    return {
      errorReason: 'Duplicate card IDs in discard selection',
      result: false,
    };
  }

  return { result: true };
}
