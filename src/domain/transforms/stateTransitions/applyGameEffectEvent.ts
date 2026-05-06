/**
 * Routes game effect events to their corresponding apply functions.
 */

import type { Board } from "@entities";
import type { GameEffectEventForBoard } from "@events";
import type { GameStateForBoard } from "@game";
import {
  applyCompleteAttackApplyEvent,
  applyCompleteCleanupPhaseEvent,
  applyCompleteIssueCommandsPhaseEvent,
  applyCompleteMeleeResolutionEvent,
  applyCompleteMoveCommandersPhaseEvent,
  applyCompletePlayCardsPhaseEvent,
  applyCompleteRangedAttackCommandEvent,
  applyCompleteResolveMeleePhaseEvent,
  applyCompleteUnitMovementEvent,
  applyDiscardPlayedCardsEvent,
  applyResolveEngageRetreatOptionEvent,
  applyResolveFlankEngagementEvent,
  applyResolveInitiativeEvent,
  applyResolveMeleeEvent,
  applyResolveRallyEvent,
  applyResolveRangedAttackEvent,
  applyResolveRetreatEvent,
  applyResolveReverseEvent,
  applyResolveRoutEvent,
  applyResolveUnitsBrokenEvent,
  applyRevealCardsEvent,
  applyStartEngagementEvent,
  applyTriggerRoutFromRetreatEvent,
} from "./applyEffects";

/**
 * Routes game effect events to their corresponding apply functions.
 */
export function applyGameEffectEvent<TBoard extends Board>(
  event: GameEffectEventForBoard<TBoard>,
  state: GameStateForBoard<TBoard>,
): GameStateForBoard<TBoard> {
  switch (event.effectType) {
    case "completeAttackApply":
      return applyCompleteAttackApplyEvent(event, state);
    case "completeCleanupPhase":
      return applyCompleteCleanupPhaseEvent(event, state);
    case "completeIssueCommandsPhase":
      return applyCompleteIssueCommandsPhaseEvent(event, state);
    case "completeMeleeResolution":
      return applyCompleteMeleeResolutionEvent(event, state);
    case "completeMoveCommandersPhase":
      return applyCompleteMoveCommandersPhaseEvent(event, state);
    case "completePlayCardsPhase":
      return applyCompletePlayCardsPhaseEvent(event, state);
    case "completeRangedAttackCommand":
      return applyCompleteRangedAttackCommandEvent(event, state);
    case "completeResolveMeleePhase":
      return applyCompleteResolveMeleePhaseEvent(state);
    case "completeUnitMovement":
      return applyCompleteUnitMovementEvent(event, state);
    case "discardPlayedCards":
      return applyDiscardPlayedCardsEvent(event, state);
    case "resolveInitiative":
      return applyResolveInitiativeEvent(event, state);
    case "resolveRally":
      return applyResolveRallyEvent(event, state);
    case "resolveUnitsBroken":
      return applyResolveUnitsBrokenEvent(event, state);
    case "revealCards":
      return applyRevealCardsEvent(event, state);
    case "resolveMelee":
      return applyResolveMeleeEvent(event, state);
    case "resolveRangedAttack":
      return applyResolveRangedAttackEvent(event, state);
    case "resolveRetreat":
      return applyResolveRetreatEvent(event, state);
    case "resolveReverse":
      return applyResolveReverseEvent(event, state);
    case "resolveRout":
      return applyResolveRoutEvent(event, state);
    case "resolveEngageRetreatOption":
      return applyResolveEngageRetreatOptionEvent(event, state);
    case "resolveFlankEngagement":
      return applyResolveFlankEngagementEvent(event, state);
    case "startEngagement":
      return applyStartEngagementEvent(event, state);
    case "triggerRoutFromRetreat":
      return applyTriggerRoutFromRetreatEvent(event, state);
    default: {
      const _exhaustive: never = event;
      throw new Error("Unreachable: unhandled game effect event (effectType not in switch)");
    }
  }
}
