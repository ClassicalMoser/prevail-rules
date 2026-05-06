import type { GameEffectEvent, GameEffectEventForBoard, GameEffectType } from "@events";
import type { GameState, GameStateForBoard } from "@game";
import {
  generateDiscardPlayedCardsEvent,
  generateResolveInitiativeEvent,
  generateResolveRallyEvent,
  generateResolveUnitsBrokenEvent,
  generateRevealCardsEvent,
} from "./cards";
import {
  generateCompleteCleanupPhaseEvent,
  generateCompleteIssueCommandsPhaseEvent,
  generateCompleteMoveCommandersPhaseEvent,
  generateCompletePlayCardsPhaseEvent,
  generateCompleteResolveMeleePhaseEvent,
} from "./completePhase";
import {
  generateResolveRetreatEvent,
  generateResolveReverseEvent,
  generateResolveRoutEvent,
  generateTriggerRoutFromRetreatEvent,
} from "./defenseResult";
import {
  generateCompleteUnitMovementEvent,
  generateResolveEngageRetreatOptionEvent,
  generateResolveFlankEngagementEvent,
  generateStartEngagementEvent,
} from "./movement";
import {
  generateCompleteAttackApplyEvent,
  generateCompleteMeleeResolutionEvent,
  generateCompleteRangedAttackCommandEvent,
  generateResolveMeleeEvent,
  generateResolveRangedAttackEvent,
} from "./resolveAttack";
import { Board } from "@entities";

/**
 * Generates a game effect event using the appropriate procedure
 * based on the effect type.
 * Procedures are not strictly deterministic (some generate randomness);
 * the event (with results) is what makes it deterministically replayable.
 * When `effectType` is a string literal (or a generic type parameter extending `GameEffectType`),
 * the return type is `GameEffectEvent<TBoard, that literal>`.
 *
 * @param state - The current game state
 * @param eventNumber - The ordered index of this event in the round (zero-indexed)
 * @param effectType - The type of game effect to generate
 * @returns The generated game effect event with the specific type for the effect
 * @throws Error if the effect type doesn't have a procedure
 *
 * @warning Game state is trusted as internally consistent for this function.
 */
export function generateEventFromProcedureForBoard<TBoard extends Board>(
  state: GameStateForBoard<TBoard>,
  eventNumber: number,
  effectType: GameEffectType,
): GameEffectEventForBoard<TBoard> {
  switch (effectType) {
    case "completeAttackApply":
      return generateCompleteAttackApplyEvent(state, eventNumber);
    case "completeCleanupPhase":
      // Widen type to GameState since spatial information is not needed
      return generateCompleteCleanupPhaseEvent(state as GameState, eventNumber);
    case "completeIssueCommandsPhase":
      return generateCompleteIssueCommandsPhaseEvent(state, eventNumber);
    case "completeMeleeResolution":
      return generateCompleteMeleeResolutionEvent(eventNumber);
    case "completeMoveCommandersPhase":
      // Widen type to GameState since spatial information is not needed
      return generateCompleteMoveCommandersPhaseEvent(state as GameState, eventNumber);
    case "completePlayCardsPhase":
      // Widen type to GameState since spatial information is not needed
      return generateCompletePlayCardsPhaseEvent(state as GameState, eventNumber);
    case "completeRangedAttackCommand":
      return generateCompleteRangedAttackCommandEvent(eventNumber);
    case "completeResolveMeleePhase":
      // Widen type to GameState since spatial information is not needed
      return generateCompleteResolveMeleePhaseEvent(state as GameState, eventNumber);
    case "completeUnitMovement":
      return generateCompleteUnitMovementEvent(eventNumber);
    case "discardPlayedCards":
      // Widen type to GameState since spatial information is not needed
      return generateDiscardPlayedCardsEvent(state as GameState, eventNumber);
    case "resolveEngageRetreatOption":
      return generateResolveEngageRetreatOptionEvent(state, eventNumber);
    case "resolveFlankEngagement":
      return generateResolveFlankEngagementEvent(state, eventNumber);
    case "resolveInitiative":
      // Widen type to GameState since spatial information is not needed
      return generateResolveInitiativeEvent(state as GameState, eventNumber);
    case "resolveMelee":
      return generateResolveMeleeEvent(state, eventNumber);
    case "resolveRally": {
      // Widen type to GameState since spatial information is not needed
      return generateResolveRallyEvent(state as GameState, eventNumber);
    }
    case "resolveRangedAttack":
      return generateResolveRangedAttackEvent(state, eventNumber);
    case "resolveRetreat":
      return generateResolveRetreatEvent(state, eventNumber);
    case "resolveReverse":
      return generateResolveReverseEvent(state, eventNumber);
    case "resolveRout":
      return generateResolveRoutEvent(state, eventNumber);
    case "resolveUnitsBroken": {
      // Widen type to GameState since spatial information is not needed
      return generateResolveUnitsBrokenEvent(state as GameState, eventNumber);
    }
    case "revealCards":
      return generateRevealCardsEvent(eventNumber);
    case "startEngagement":
      return generateStartEngagementEvent(state, eventNumber);
    case "triggerRoutFromRetreat":
      return generateTriggerRoutFromRetreatEvent(state, eventNumber);

    default: {
      const _exhaustive: never = effectType;
      throw new Error(`No procedure exists for effect type: ${_exhaustive as string}`);
    }
  }
}

export function generateEventFromProcedure(
  state: GameState,
  eventNumber: number,
  effectType: GameEffectType,
): GameEffectEvent {
  const boardType = state.boardType;
  switch (boardType) {
    case "small":
      return generateEventFromProcedureForBoard(state, eventNumber, effectType);
    case "standard":
      return generateEventFromProcedureForBoard(state, eventNumber, effectType);
    case "large":
      return generateEventFromProcedureForBoard(state, eventNumber, effectType);
    default: {
      const _exhaustive: never = boardType;
      throw new Error(`Unknown board type: ${_exhaustive as string}`);
    }
  }
}
