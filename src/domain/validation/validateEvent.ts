import type { Board, ValidationResult } from '@entities';
import type { EventForBoard } from '@events';
import type {
  CleanupPhaseState,
  GameStateForBoard,
  MoveCommandersPhaseState,
  PlayCardsPhaseState,
} from '@game';
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
  event: EventForBoard<TBoard>,
  state: GameStateForBoard<TBoard>,
): ValidationResult {
  const roundState = state.currentRoundState;

  if (!roundState) {
    return {
      errorReason: 'No round state found',
      result: false,
    };
  }

  if (roundState.currentPhaseState === 'none') {
    return {
      errorReason: 'No current phase state found',
      result: false,
    };
  }

  const currentPhase = roundState.currentPhaseState;

  // Route to phase-specific validation
  switch (currentPhase.phase) {
    case 'playCards': {
      return validatePlayCardsPhaseEvent(
        event,
        state as GameStateForBoard<TBoard> & {
          currentRoundState: {
            currentPhaseState: PlayCardsPhaseState;
          };
        },
      );
    }

    case 'moveCommanders': {
      return validateMoveCommandersPhaseEvent(
        event,
        state as GameStateForBoard<TBoard> & {
          currentRoundState: {
            currentPhaseState: MoveCommandersPhaseState;
          };
        },
      );
    }

    case 'issueCommands': {
      // TODO: Implement validateIssueCommandsPhaseEvent
      return {
        errorReason: 'IssueCommands phase validation not yet implemented',
        result: false,
      };
    }

    case 'resolveMelee': {
      // TODO: Implement validateResolveMeleePhaseEvent
      return {
        errorReason: 'ResolveMelee phase validation not yet implemented',
        result: false,
      };
    }

    case 'cleanup': {
      return validateCleanupPhaseEvent(
        event,
        state as GameStateForBoard<TBoard> & {
          currentRoundState: {
            currentPhaseState: CleanupPhaseState;
          };
        },
      );
    }

    default: {
      return {
        errorReason: `Invalid phase: ${currentPhase}`,
        result: false,
      };
    }
  }
}
