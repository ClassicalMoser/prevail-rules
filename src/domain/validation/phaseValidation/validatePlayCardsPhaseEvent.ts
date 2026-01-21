import type {
  Board,
  GameState,
  PlayCardsPhaseState,
  ValidationResult,
} from '@entities';
import type { Event } from '@events';
import { isValidChooseCardEvent } from '@validation/playerChoice';

/**
 * Validates an event for the PlayCards phase.
 *
 * @param event - The event to validate
 * @param state - The current game state with PlayCards phase
 * @returns ValidationResult indicating if the event is valid
 */
export function validatePlayCardsPhaseEvent<TBoard extends Board>(
  event: Event<TBoard>,
  state: GameState<TBoard> & {
    currentRoundState: {
      currentPhaseState: PlayCardsPhaseState;
    };
  },
): ValidationResult {
  const phaseState = state.currentRoundState.currentPhaseState;

  switch (phaseState.step) {
    case 'chooseCards':
      if (
        event.eventType === 'playerChoice' &&
        event.choiceType === 'chooseCard'
      ) {
        return isValidChooseCardEvent(event, state);
      }
      return {
        result: false,
        errorReason: 'Expected ChooseCardEvent',
      };

    case 'revealCards':
      if (
        event.eventType === 'gameEffect' &&
        event.effectType === 'revealCards'
      ) {
        return { result: true };
      }
      return {
        result: false,
        errorReason: 'Expected RevealCardsEvent',
      };

    case 'assignInitiative':
      if (
        event.eventType === 'gameEffect' &&
        event.effectType === 'resolveInitiative'
      ) {
        return { result: true };
      }
      return {
        result: false,
        errorReason: 'Expected ResolveInitiativeEvent',
      };

    case 'complete':
      if (
        event.eventType === 'gameEffect' &&
        event.effectType === 'completePlayCardsPhase'
      ) {
        return { result: true };
      }
      return {
        result: false,
        errorReason: 'Expected CompletePlayCardsPhaseEvent',
      };

    default:
      return {
        result: false,
        errorReason: `Invalid playCards phase step: ${phaseState.step}`,
      };
  }
}
