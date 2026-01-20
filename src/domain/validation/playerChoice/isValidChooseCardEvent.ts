import type { Board, GameState, ValidationResult } from '@entities';
import type { ChooseCardEvent } from '@events';

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
  state: GameState<TBoard>,
): ValidationResult {
  try {
    const { player, card } = event;
    const currentPhaseState = state.currentRoundState.currentPhaseState;

    // Check phase state exists
    if (!currentPhaseState) {
      return {
        result: false,
        errorReason: 'No current phase state found',
      };
    }

    // Check correct phase
    if (currentPhaseState.phase !== 'playCards') {
      return {
        result: false,
        errorReason: `Current phase is ${currentPhaseState.phase}, not playCards`,
      };
    }

    // Check correct step
    if (currentPhaseState.step !== 'chooseCards') {
      return {
        result: false,
        errorReason: `Play cards phase is on ${currentPhaseState.step} step, not chooseCards`,
      };
    }

    // Check player hasn't already chosen
    if (state.cardState[player].awaitingPlay !== null) {
      return {
        result: false,
        errorReason: `Player ${player} has already chosen a card`,
      };
    }

    // Check card is in player's hand
    const playerHand = state.cardState[player].inHand;
    const cardInHand = playerHand.some((c) => c.id === card.id);
    if (!cardInHand) {
      return {
        result: false,
        errorReason: `Card ${card.id} is not in ${player} player's hand`,
      };
    }

    // Valid
    return {
      result: true,
    };
  } catch (error) {
    return {
      result: false,
      errorReason: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
