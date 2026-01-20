import type { Board, GameState, MoveCommandersPhaseState, ValidationResult } from '@entities';
import type { Event } from '@events';
import { isValidMoveCommanderEvent } from '@validation/playerChoice';

/**
 * Validates an event for the MoveCommanders phase.
 * 
 * @param event - The event to validate
 * @param state - The current game state with MoveCommanders phase
 * @returns ValidationResult indicating if the event is valid
 */
export function validateMoveCommandersPhaseEvent<TBoard extends Board>(
  event: Event,
  state: GameState<TBoard> & {
    currentRoundState: {
      currentPhaseState: MoveCommandersPhaseState;
    };
  },
): ValidationResult {
  const phaseState = state.currentRoundState.currentPhaseState;

  switch (phaseState.step) {
    case 'moveFirstCommander':
    case 'moveSecondCommander':
      if (event.eventType === 'playerChoice' && event.choiceType === 'moveCommander') {
        return isValidMoveCommanderEvent(event, state);
      }
      return {
        result: false,
        errorReason: 'Expected MoveCommanderEvent',
      };
    
    case 'complete':
      if (event.eventType === 'gameEffect' && event.effectType === 'completeMoveCommandersPhase') {
        return { result: true };
      }
      return {
        result: false,
        errorReason: 'Expected CompleteMoveCommandersPhaseEvent',
      };
    
    default:
      return {
        result: false,
        errorReason: `Invalid moveCommanders phase step: ${phaseState.step}`,
      };
  }
}
