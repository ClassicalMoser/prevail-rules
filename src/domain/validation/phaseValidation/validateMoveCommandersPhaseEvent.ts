import type { Board, ValidationResult } from '@entities';
import type { Event, PlayerChoiceEvent } from '@events';
import type { GameState, MoveCommandersPhaseState } from '@game';
import { validatePlayerChoice } from '@validation/playerChoice';

/**
 * @deprecated Validation under rework.
 */
export function validateMoveCommandersPhaseEvent<TBoard extends Board>(
  event: Event,
  state: GameState & {
    currentRoundState: {
      currentPhaseState: MoveCommandersPhaseState;
    };
  },
): ValidationResult {
  const phaseState = state.currentRoundState.currentPhaseState;

  switch (phaseState.step) {
    case 'moveFirstCommander':
    case 'moveSecondCommander': {
      if (event.eventType === 'playerChoice') {
        return validatePlayerChoice(
          event as PlayerChoiceEvent,
          state as GameState,
        );
      }
      return {
        errorReason: 'Expected MoveCommanderEvent',
        result: false,
      };
    }

    case 'complete': {
      if (
        event.eventType === 'gameEffect' &&
        event.effectType === 'completeMoveCommandersPhase'
      ) {
        return { result: true };
      }
      return {
        errorReason: 'Expected CompleteMoveCommandersPhaseEvent',
        result: false,
      };
    }

    default: {
      return {
        errorReason: `Invalid moveCommanders phase step: ${phaseState.step}`,
        result: false,
      };
    }
  }
}
