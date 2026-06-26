import type { Board, ValidationResult } from '@entities';
import type { EventForBoard, PlayerChoiceEvent } from '@events';
import type { CleanupPhaseState, GameState, GameStateForBoard } from '@game';
import { validatePlayerChoice } from '@validation/playerChoice';

/**
 * Validates an event for the Cleanup phase.
 *
 * @param event - The event to validate
 * @param state - The current game state with Cleanup phase
 * @returns ValidationResult indicating if the event is valid
 */
export function validateCleanupPhaseEvent<TBoard extends Board>(
  event: EventForBoard<TBoard>,
  state: GameStateForBoard<TBoard> & {
    currentRoundState: {
      currentPhaseState: CleanupPhaseState;
    };
  },
): ValidationResult {
  const phaseState = state.currentRoundState.currentPhaseState;

  switch (phaseState.step) {
    case 'discardPlayedCards': {
      if (
        event.eventType === 'gameEffect' &&
        event.effectType === 'discardPlayedCards'
      ) {
        return { result: true };
      }
      return {
        errorReason: 'Expected DiscardPlayedCardsEvent',
        result: false,
      };
    }

    case 'firstPlayerChooseRally':
    case 'secondPlayerChooseRally': {
      if (event.eventType === 'playerChoice') {
        return validatePlayerChoice(
          event as PlayerChoiceEvent,
          state as GameState,
        );
      }
      return {
        errorReason: 'Expected ChooseRallyEvent',
        result: false,
      };
    }

    case 'firstPlayerResolveRally':
    case 'secondPlayerResolveRally': {
      // Complex substep - check rally resolution state to determine expected event
      const isFirstPlayer = phaseState.step === 'firstPlayerResolveRally';
      const rallyState = isFirstPlayer
        ? phaseState.firstPlayerRallyResolutionState
        : phaseState.secondPlayerRallyResolutionState;

      if (rallyState === 'pending') {
        return {
          errorReason: 'Rally resolution state not found',
          result: false,
        };
      }

      // Check substep progression
      if (!rallyState.rallyResolved) {
        // Expect resolveRally
        if (
          event.eventType === 'gameEffect' &&
          event.effectType === 'resolveRally'
        ) {
          return { result: true };
        }
        return {
          errorReason: 'Expected resolveRally game effect',
          result: false,
        };
      }

      if (rallyState.unitsLostSupport === 'pending') {
        // Expect resolveUnitsBroken
        if (
          event.eventType === 'gameEffect' &&
          event.effectType === 'resolveUnitsBroken'
        ) {
          return { result: true };
        }
        return {
          errorReason: 'Expected resolveUnitsBroken game effect',
          result: false,
        };
      }

      // Check for rout state
      if (
        rallyState.routState !== 'pending' &&
        !rallyState.routState.cardsChosen
      ) {
        // Expect chooseRoutDiscard
        if (event.eventType === 'playerChoice') {
          return validatePlayerChoice(
            event as PlayerChoiceEvent,
            state as GameState,
          );
        }
        return {
          errorReason: 'Expected chooseRoutDiscard player choice',
          result: false,
        };
      }

      // Rally fully resolved - should have advanced
      return {
        errorReason: 'Rally resolution complete but step not advanced',
        result: false,
      };
    }

    case 'complete': {
      if (
        event.eventType === 'gameEffect' &&
        event.effectType === 'completeCleanupPhase'
      ) {
        return { result: true };
      }
      return {
        errorReason: 'Expected CompleteCleanupPhaseEvent',
        result: false,
      };
    }

    default: {
      return {
        errorReason: `Invalid cleanup phase step: ${phaseState.step}`,
        result: false,
      };
    }
  }
}
