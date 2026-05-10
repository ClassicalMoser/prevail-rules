import type { Board, ValidationResult } from '@entities';
import type { EventForBoard, PlayerChoiceEvent } from '@events';
import type { GameState, GameStateForBoard, PlayCardsPhaseState } from '@game';
import { validatePlayerChoice } from '@validation/playerChoice';

/**
 * @deprecated Validation under rework.
 */
export function validatePlayCardsPhaseEvent<TBoard extends Board>(
  event: EventForBoard<TBoard>,
  state: GameStateForBoard<TBoard> & {
    currentRoundState: {
      currentPhaseState: PlayCardsPhaseState;
    };
  },
): ValidationResult {
  const phaseState = state.currentRoundState.currentPhaseState;

  switch (phaseState.step) {
    case 'chooseCards': {
      if (event.eventType === 'playerChoice') {
        return validatePlayerChoice(
          event as PlayerChoiceEvent,
          state as GameState,
        );
      }
      return {
        errorReason: 'Expected ChooseCardEvent',
        result: false,
      };
    }

    case 'revealCards': {
      if (
        event.eventType === 'gameEffect' &&
        event.effectType === 'revealCards'
      ) {
        return { result: true };
      }
      return {
        errorReason: 'Expected RevealCardsEvent',
        result: false,
      };
    }

    case 'assignInitiative': {
      if (
        event.eventType === 'gameEffect' &&
        event.effectType === 'resolveInitiative'
      ) {
        return { result: true };
      }
      return {
        errorReason: 'Expected ResolveInitiativeEvent',
        result: false,
      };
    }

    case 'complete': {
      if (
        event.eventType === 'gameEffect' &&
        event.effectType === 'completePlayCardsPhase'
      ) {
        return { result: true };
      }
      return {
        errorReason: 'Expected CompletePlayCardsPhaseEvent',
        result: false,
      };
    }

    default: {
      return {
        errorReason: `Invalid playCards phase step: ${phaseState.step}`,
        result: false,
      };
    }
  }
}
