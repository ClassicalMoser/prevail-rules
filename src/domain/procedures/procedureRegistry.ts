import type { GameEffectEvent, GameEffectType } from '@events';
import type { RandomSource } from '@utils';
import type { AuthoritativeGameState } from '@game';
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
  generateOpenRetreatFromEngagementEvent,
  generateResolveEngageRetreatOptionEvent,
  generateResolveFlankEngagementEvent,
  generateStartEngagementEvent,
} from './movement';
import {
  generateCompleteAttackApplyEvent,
  generateCompleteMeleeResolutionEvent,
  generateCompleteRangedAttackCommandEvent,
  generateCompleteRangedAttackEvent,
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
 * @param effectType - The type of game effect to generate
 * @param random - The source any drawing procedure takes its draw from
 * @returns The generated game effect event with the specific type for the effect
 * @throws Error if the effect type doesn't have a procedure
 *
 * WARNING: Game state is trusted as internally consistent for this function.
 */
export function generateEventFromProcedure(
  state: AuthoritativeGameState,
  effectType: GameEffectType,
  random: RandomSource,
): GameEffectEvent {
  switch (effectType) {
    case 'completeAttackApply': {
      return generateCompleteAttackApplyEvent(state);
    }
    case 'completeCleanupPhase': {
      return generateCompleteCleanupPhaseEvent(state);
    }
    case 'completeIssueCommandsPhase': {
      return generateCompleteIssueCommandsPhaseEvent(state);
    }
    case 'completeMeleeResolution': {
      return generateCompleteMeleeResolutionEvent();
    }
    case 'completeMoveCommandersPhase': {
      return generateCompleteMoveCommandersPhaseEvent(state);
    }
    case 'completeMovementCommand': {
      return generateCompleteMovementCommandEvent();
    }
    case 'completePlayCardsPhase': {
      return generateCompletePlayCardsPhaseEvent(state);
    }
    case 'completeRangedAttack': {
      return generateCompleteRangedAttackEvent();
    }
    case 'completeRangedAttackCommand': {
      return generateCompleteRangedAttackCommandEvent();
    }
    case 'completeResolveMeleePhase': {
      return generateCompleteResolveMeleePhaseEvent(state);
    }
    case 'completeUnitMovement': {
      return generateCompleteUnitMovementEvent();
    }
    case 'discardPlayedCards': {
      return generateDiscardPlayedCardsEvent(state);
    }
    case 'gameOver': {
      return generateGameOverEvent(state);
    }
    case 'openRetreatFromAttackApply': {
      return generateOpenRetreatFromAttackApplyEvent(state);
    }
    case 'openReverseFromAttackApply': {
      return generateOpenReverseFromAttackApplyEvent(state);
    }
    case 'openRoutFromAttackApply': {
      return generateOpenRoutFromAttackApplyEvent(state);
    }
    case 'openRetreatFromEngagement': {
      return generateOpenRetreatFromEngagementEvent();
    }
    case 'resolveEngageRetreatOption': {
      return generateResolveEngageRetreatOptionEvent(state);
    }
    case 'resolveFlankEngagement': {
      return generateResolveFlankEngagementEvent(state);
    }
    case 'resolveInitiative': {
      return generateResolveInitiativeEvent(state);
    }
    case 'resolveMelee': {
      return generateResolveMeleeEvent(state);
    }
    case 'resolveRally': {
      return generateResolveRallyEvent(state, random);
    }
    case 'resolveRangedAttack': {
      return generateResolveRangedAttackEvent(state);
    }
    case 'resolveRetreat': {
      return generateResolveRetreatEvent(state);
    }
    case 'resolveReverse': {
      return generateResolveReverseEvent(state);
    }
    case 'resolveRout': {
      return generateResolveRoutEvent(state);
    }
    case 'revealCards': {
      return generateRevealCardsEvent(state);
    }
    case 'startEngagement': {
      return generateStartEngagementEvent(state);
    }
    case 'triggerRoutFromRetreat': {
      return generateTriggerRoutFromRetreatEvent(state);
    }

    default: {
      const _exhaustive: never = effectType;
      throw new Error(`No procedure exists for effect type: ${_exhaustive}`);
    }
  }
}
