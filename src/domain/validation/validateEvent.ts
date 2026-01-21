import type {
  Board,
  CleanupPhaseState,
  GameState,
  MoveCommandersPhaseState,
  PlayCardsPhaseState,
  ValidationResult,
} from '@entities';
import type { Event } from '@events';
import {
  validateCleanupPhaseEvent,
  validateMoveCommandersPhaseEvent,
  validatePlayCardsPhaseEvent,
} from './phaseValidation';

/**
 * Validates an event against the current game state.
 * Routes to phase-specific validation based on current phase.
 *
 * @param event - The event to validate
 * @param state - The current game state
 * @returns ValidationResult indicating if the event is valid for the current state
 *
 * @example
 * ```typescript
 * const validation = validateEvent(event, state);
 * if (!validation.result) {
 *   return { success: false, error: validation.errorReason };
 * }
 * const newState = applyEvent(event, state);
 * ```
 */
export function validateEvent<TBoard extends Board>(
  event: Event<TBoard>,
  state: GameState<TBoard>,
): ValidationResult {
  const roundState = state.currentRoundState;

  if (!roundState) {
    return {
      result: false,
      errorReason: 'No round state found',
    };
  }

  if (!roundState.currentPhaseState) {
    return {
      result: false,
      errorReason: 'No current phase state found',
    };
  }

  const currentPhase = roundState.currentPhaseState;

  // Route to phase-specific validation
  switch (currentPhase.phase) {
    case 'playCards':
      return validatePlayCardsPhaseEvent(
        event,
        state as GameState<TBoard> & {
          currentRoundState: {
            currentPhaseState: PlayCardsPhaseState;
          };
        },
      );

    case 'moveCommanders':
      return validateMoveCommandersPhaseEvent(
        event,
        state as GameState<TBoard> & {
          currentRoundState: {
            currentPhaseState: MoveCommandersPhaseState;
          };
        },
      );

    case 'issueCommands':
      // TODO: Implement validateIssueCommandsPhaseEvent
      return {
        result: false,
        errorReason: 'IssueCommands phase validation not yet implemented',
      };

    case 'resolveMelee':
      // TODO: Implement validateResolveMeleePhaseEvent
      return {
        result: false,
        errorReason: 'ResolveMelee phase validation not yet implemented',
      };

    case 'cleanup':
      return validateCleanupPhaseEvent(
        event,
        state as GameState<TBoard> & {
          currentRoundState: {
            currentPhaseState: CleanupPhaseState;
          };
        },
      );

    default:
      return {
        result: false,
        errorReason: `Invalid phase: ${currentPhase}`,
      };
  }
}
