import type { Board, ValidationResult } from '@entities';
import type { ChooseCardEvent } from '@events';
import type { GameStateForBoard } from '@game';

/**
 * Validates whether a ChooseCardEvent can be applied to the current game state.
 * This is used for proactive validation before attempting to apply the event.
 *
 * @param event - The choose card event to validate
 * @param state - The current game state
 * @returns ValidationResult indicating if the event is valid
 *
 * @example
 * ```typescript
 * const validation = isValidChooseCardEvent(event, state);
 * if (!validation.result) {
 *   // Reject the event without processing
 *   return { success: false, error: validation.errorReason };
 * }
 * // Proceed to apply the event
 * const newState = applyChooseCardEvent(event, state);
 * ```
 */
export function isValidChooseCardEvent<TBoard extends Board>(
  event: ChooseCardEvent,
  state: GameStateForBoard<TBoard>,
): ValidationResult {
  try {
    const { player, card } = event;
    const { currentPhaseState } = state.currentRoundState;

    // Check phase state exists
    if (currentPhaseState === 'none') {
      return {
        errorReason: 'No current phase state found',
        result: false,
      };
    }

    // Check correct phase
    if (currentPhaseState.phase !== 'playCards') {
      return {
        errorReason: `Current phase is ${currentPhaseState.phase}, not playCards`,
        result: false,
      };
    }

    // Check correct step
    if (currentPhaseState.step !== 'chooseCards') {
      return {
        errorReason: `Play cards phase is on ${currentPhaseState.step} step, not chooseCards`,
        result: false,
      };
    }

    // Check player hasn't already chosen
    if (state.cardState[player].awaitingPlay !== null) {
      return {
        errorReason: `Player ${player} has already chosen a card`,
        result: false,
      };
    }

    // Check card is in player's hand
    const playerHand = state.cardState[player].inHand;
    const cardInHand = playerHand.some((c) => c.id === card.id);
    if (!cardInHand) {
      return {
        errorReason: `Card ${card.id} is not in ${player} player's hand`,
        result: false,
      };
    }

    // Valid
    return {
      result: true,
    };
  } catch (error) {
    return {
      errorReason: error instanceof Error ? error.message : 'Unknown error',
      result: false,
    };
  }
}
