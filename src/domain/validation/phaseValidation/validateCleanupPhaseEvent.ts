import type { Board, CleanupPhaseState, GameState, ValidationResult } from '@entities';
import type { Event } from '@events';
import { isValidChooseRallyEvent } from '@validation/playerChoice';

/**
 * Validates an event for the Cleanup phase.
 * 
 * @param event - The event to validate
 * @param state - The current game state with Cleanup phase
 * @returns ValidationResult indicating if the event is valid
 */
export function validateCleanupPhaseEvent<TBoard extends Board>(
  event: Event,
  state: GameState<TBoard> & {
    currentRoundState: {
      currentPhaseState: CleanupPhaseState;
    };
  },
): ValidationResult {
  const phaseState = state.currentRoundState.currentPhaseState;

  switch (phaseState.step) {
    case 'discardPlayedCards':
      if (event.eventType === 'gameEffect' && event.effectType === 'discardPlayedCards') {
        return { result: true };
      }
      return {
        result: false,
        errorReason: 'Expected DiscardPlayedCardsEvent',
      };
    
    case 'firstPlayerChooseRally':
    case 'secondPlayerChooseRally':
      if (event.eventType === 'playerChoice' && event.choiceType === 'chooseRally') {
        return isValidChooseRallyEvent(event, state);
      }
      return {
        result: false,
        errorReason: 'Expected ChooseRallyEvent',
      };
    
    case 'firstPlayerResolveRally':
    case 'secondPlayerResolveRally':
      if (event.eventType === 'gameEffect' && event.effectType === 'resolveRally') {
        return { result: true };
      }
      // TODO: Unit support events (resolveUnitsBroken) may be needed as substeps
      return {
        result: false,
        errorReason: 'Expected ResolveRallyEvent',
      };
    
    case 'complete':
      if (event.eventType === 'gameEffect' && event.effectType === 'completeCleanupPhase') {
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
