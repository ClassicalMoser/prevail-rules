/**
 * Routes game effect events to their corresponding apply functions.
 */

import type { Board, GameState } from '@entities';
import type { GameEffectEvent, GameEffectType } from '@events';
import {
  applyCompleteCleanupPhaseEvent,
  applyCompleteIssueCommandsPhaseEvent,
  applyCompleteMoveCommandersPhaseEvent,
  applyCompletePlayCardsPhaseEvent,
  applyCompleteResolveMeleePhaseEvent,
  applyDiscardPlayedCardsEvent,
  applyResolveInitiativeEvent,
  applyResolveRallyEvent,
  applyResolveRoutDiscardEvent,
  applyResolveUnitsBrokenEvent,
  applyRevealCardsEvent,
} from './stateTransitions';

/**
 * Routes game effect events to their corresponding apply functions.
 */
export function applyGameEffectEvent<TBoard extends Board>(
  event: GameEffectEvent<TBoard, GameEffectType>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  switch (event.effectType) {
    case 'completeCleanupPhase':
      return applyCompleteCleanupPhaseEvent(event, state);
    case 'completeIssueCommandsPhase':
      return applyCompleteIssueCommandsPhaseEvent(event, state);
    case 'completeMoveCommandersPhase':
      return applyCompleteMoveCommandersPhaseEvent(event, state);
    case 'completePlayCardsPhase':
      return applyCompletePlayCardsPhaseEvent(event, state);
    case 'completeResolveMeleePhase':
      return applyCompleteResolveMeleePhaseEvent(event, state);
    case 'discardPlayedCards':
      return applyDiscardPlayedCardsEvent(event, state);
    case 'resolveInitiative':
      return applyResolveInitiativeEvent(event, state);
    case 'resolveRally':
      return applyResolveRallyEvent(event, state);
    case 'resolveRoutDiscard':
      return applyResolveRoutDiscardEvent(event, state);
    case 'resolveUnitsBroken':
      return applyResolveUnitsBrokenEvent(event, state);
    case 'revealCards':
      return applyRevealCardsEvent(event, state);
    case 'resolveEngagementType':
    case 'resolveEngageRetreatOption':
    case 'resolveFlankEngagement':
    case 'completeUnitMovement':
    case 'startEngagement':
    case 'resolveMelee':
    case 'resolveRangedAttack':
    case 'resolveRetreat':
    case 'resolveReverse':
    case 'resolveRout':
    case 'completeRangedAttackCommand':
    case 'completeAttackApply':
      throw new Error(
        `Event type ${event.effectType} is not yet implemented in the transform engine`,
      );
    default: {
      // Exhaustiveness check for TypeScript
      const _exhaustive: never = event;
      throw new Error(
        `Unknown game effect event type: ${(_exhaustive as GameEffectEvent<TBoard, GameEffectType>).effectType}`,
      );
    }
  }
}
