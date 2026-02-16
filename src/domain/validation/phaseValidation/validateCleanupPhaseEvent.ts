import type {
  Board,
  CleanupPhaseState,
  GameState,
  ValidationResult,
} from '@entities';
import type { Event } from '@events';
import { getCurrentRallyResolutionState } from '@queries/sequencing';
import {
  isValidChooseRallyEvent,
  isValidChooseRoutDiscardEvent,
} from '@validation/playerChoice';

/**
 * Validates an event for the Cleanup phase.
 *
 * @param event - The event to validate
 * @param state - The current game state with Cleanup phase
 * @returns ValidationResult indicating if the event is valid
 */
export function validateCleanupPhaseEvent<TBoard extends Board>(
  event: Event<TBoard>,
  state: GameState<TBoard> & {
    currentRoundState: {
      currentPhaseState: CleanupPhaseState;
    };
  },
): ValidationResult {
  const phaseState = state.currentRoundState.currentPhaseState;

  switch (phaseState.step) {
    case 'discardPlayedCards':
      if (
        event.eventType === 'gameEffect' &&
        event.effectType === 'discardPlayedCards'
      ) {
        return { result: true };
      }
      return {
        result: false,
        errorReason: 'Expected DiscardPlayedCardsEvent',
      };

    case 'firstPlayerChooseRally':
    case 'secondPlayerChooseRally':
      if (
        event.eventType === 'playerChoice' &&
        event.choiceType === 'chooseRally'
      ) {
        return isValidChooseRallyEvent(event, state);
      }
      return {
        result: false,
        errorReason: 'Expected ChooseRallyEvent',
      };

    case 'firstPlayerResolveRally':
    case 'secondPlayerResolveRally': {
      // Use shared sequencing query instead of inline state navigation
      let rallyState;
      try {
        rallyState = getCurrentRallyResolutionState(state);
      } catch {
        return {
          result: false,
          errorReason: 'Rally resolution state not found',
        };
      }

      // Check substep progression
      if (!rallyState.rallyResolved) {
        if (
          event.eventType === 'gameEffect' &&
          event.effectType === 'resolveRally'
        ) {
          return { result: true };
        }
        return {
          result: false,
          errorReason: 'Expected resolveRally game effect',
        };
      }

      if (rallyState.unitsLostSupport === undefined) {
        if (
          event.eventType === 'gameEffect' &&
          event.effectType === 'resolveUnitsBroken'
        ) {
          return { result: true };
        }
        return {
          result: false,
          errorReason: 'Expected resolveUnitsBroken game effect',
        };
      }

      // Check for rout state
      if (rallyState.routState) {
        if (!rallyState.routState.cardsChosen) {
          if (
            event.eventType === 'playerChoice' &&
            event.choiceType === 'chooseRoutDiscard'
          ) {
            return isValidChooseRoutDiscardEvent(event, state);
          }
          return {
            result: false,
            errorReason: 'Expected chooseRoutDiscard player choice',
          };
        }
      }

      // Rally fully resolved - should have advanced
      return {
        result: false,
        errorReason: 'Rally resolution complete but step not advanced',
      };
    }

    case 'complete':
      if (
        event.eventType === 'gameEffect' &&
        event.effectType === 'completeCleanupPhase'
      ) {
        return { result: true };
      }
      return {
        result: false,
        errorReason: 'Expected CompleteCleanupPhaseEvent',
      };

    default:
      return {
        result: false,
        errorReason: `Invalid cleanup phase step: ${phaseState.step}`,
      };
  }
}
