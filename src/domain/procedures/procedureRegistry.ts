import type { GameEffectEvent, GameEffectType } from '@events';
import type { RandomSource } from '@utils';
import type { GameStateForVisibility } from '@game';
import {
  generateDiscardPlayedCardsEvent,
  generateGameOverEvent,
  generateResolveInitiativeEvent,
  generateResolveRallyEvent,
  generateRevealCardsEvent,
} from './cards';
import {
  generateCompleteCleanupPhaseEvent,
  generateCompleteIssueCommandsPhaseEvent,
  generateCompleteMoveCommandersPhaseEvent,
  generateCompletePlayCardsPhaseEvent,
  generateCompleteResolveMeleePhaseEvent,
} from './completePhase';
import {
  generateOpenRetreatFromAttackApplyEvent,
  generateOpenReverseFromAttackApplyEvent,
  generateOpenRoutFromAttackApplyEvent,
  generateResolveRetreatEvent,
  generateResolveReverseEvent,
  generateResolveRoutEvent,
  generateTriggerRoutFromRetreatEvent,
} from './defenseResult';
import {
  generateCompleteMovementCommandEvent,
  generateCompleteUnitMovementEvent,
  generateResolveEngageRetreatOptionEvent,
  generateResolveFlankEngagementEvent,
  generateStartEngagementEvent,
} from './movement';
import {
  generateCompleteAttackApplyEvent,
  generateCompleteMeleeResolutionEvent,
  generateCompleteRangedAttackCommandEvent,
  generateResolveMeleeEvent,
  generateResolveRangedAttackEvent,
} from './resolveAttack';

/**
 * Generates a game effect event using the appropriate procedure
 * based on the effect type.
 * Procedures are not strictly deterministic (some draw at random); the event
 * (with results) is what makes it deterministically replayable. The draw is
 * taken from `random`, so a caller that fixes the source fixes the game.
 *
 * @param state - The current game state
 * @param eventNumber - The ordered index of this event in the round (zero-indexed)
 * @param effectType - The type of game effect to generate
 * @param random - The source any drawing procedure takes its draw from
 * @returns The generated game effect event with the specific type for the effect
 * @throws Error if the effect type doesn't have a procedure
 *
 * WARNING: Game state is trusted as internally consistent for this function.
 */
export function generateEventFromProcedure(
  state: GameStateForVisibility<'authoritative'>,
  eventNumber: number,
  effectType: GameEffectType,
  random: RandomSource,
): GameEffectEvent {
  switch (effectType) {
    case 'completeAttackApply': {
      return generateCompleteAttackApplyEvent(state, eventNumber);
    }
    case 'completeCleanupPhase': {
      return generateCompleteCleanupPhaseEvent(state, eventNumber);
    }
    case 'completeIssueCommandsPhase': {
      return generateCompleteIssueCommandsPhaseEvent(state, eventNumber);
    }
    case 'completeMeleeResolution': {
      return generateCompleteMeleeResolutionEvent(eventNumber);
    }
    case 'completeMoveCommandersPhase': {
      return generateCompleteMoveCommandersPhaseEvent(state, eventNumber);
    }
    case 'completeMovementCommand': {
      return generateCompleteMovementCommandEvent(eventNumber);
    }
    case 'completePlayCardsPhase': {
      return generateCompletePlayCardsPhaseEvent(state, eventNumber);
    }
    case 'completeRangedAttackCommand': {
      return generateCompleteRangedAttackCommandEvent(eventNumber);
    }
    case 'completeResolveMeleePhase': {
      return generateCompleteResolveMeleePhaseEvent(state, eventNumber);
    }
    case 'completeUnitMovement': {
      return generateCompleteUnitMovementEvent(eventNumber);
    }
    case 'discardPlayedCards': {
      return generateDiscardPlayedCardsEvent(state, eventNumber);
    }
    case 'gameOver': {
      return generateGameOverEvent(state, eventNumber);
    }
    case 'openRetreatFromAttackApply': {
      return generateOpenRetreatFromAttackApplyEvent(state, eventNumber);
    }
    case 'openReverseFromAttackApply': {
      return generateOpenReverseFromAttackApplyEvent(state, eventNumber);
    }
    case 'openRoutFromAttackApply': {
      return generateOpenRoutFromAttackApplyEvent(state, eventNumber);
    }
    case 'resolveEngageRetreatOption': {
      return generateResolveEngageRetreatOptionEvent(state, eventNumber);
    }
    case 'resolveFlankEngagement': {
      return generateResolveFlankEngagementEvent(state, eventNumber);
    }
    case 'resolveInitiative': {
      return generateResolveInitiativeEvent(state, eventNumber);
    }
    case 'resolveMelee': {
      return generateResolveMeleeEvent(state, eventNumber);
    }
    case 'resolveRally': {
      return generateResolveRallyEvent(state, eventNumber, random);
    }
    case 'resolveRangedAttack': {
      return generateResolveRangedAttackEvent(state, eventNumber);
    }
    case 'resolveRetreat': {
      return generateResolveRetreatEvent(state, eventNumber);
    }
    case 'resolveReverse': {
      return generateResolveReverseEvent(state, eventNumber);
    }
    case 'resolveRout': {
      return generateResolveRoutEvent(state, eventNumber);
    }
    case 'revealCards': {
      return generateRevealCardsEvent(state, eventNumber);
    }
    case 'startEngagement': {
      return generateStartEngagementEvent(state, eventNumber);
    }
    case 'triggerRoutFromRetreat': {
      return generateTriggerRoutFromRetreatEvent(state, eventNumber);
    }

    default: {
      const _exhaustive: never = effectType;
      throw new Error(
        `No procedure exists for effect type: ${_exhaustive as string}`,
      );
    }
  }
}
