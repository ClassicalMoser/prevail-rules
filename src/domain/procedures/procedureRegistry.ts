import type { Board, GameState } from '@entities';
import type { GameEffectEvent, GameEffectType } from '@events';
import {
  generateDiscardPlayedCardsEvent,
  generateResolveInitiativeEvent,
  generateResolveRallyEvent,
  generateResolveUnitsBrokenEvent,
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
  generateResolveRetreatEvent,
  generateResolveReverseEvent,
  generateResolveRoutEvent,
  generateTriggerRoutFromRetreatEvent,
} from './defenseResult';
import {
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

// Import the unfiltered union type for the implementation signature
type GameEffectEventUnion<TBoard extends Board> = GameEffectEvent<
  TBoard,
  GameEffectType
>;

/**
 * Generates a game effect event using the appropriate procedure
 * based on the effect type.
 * Procedures are not strictly deterministic (some generate randomness);
 * the event (with results) is what makes it deterministically replayable.
 * TypeScript will enforce the correct return types based on the effect type.
 *
 * @param state - The current game state
 * @param eventNumber - The ordered index of this event in the round (zero-indexed)
 * @param effectType - The type of game effect to generate
 * @returns The generated game effect event with the specific type for the effect
 * @throws Error if the effect type doesn't have a procedure
 *
 * @example
 * ```typescript
 * // Generate resolveRally event (randomly selects card)
 * const event = generateEventFromProcedure(state, 0, 'resolveRally');
 * // event is ResolveRallyEvent<TBoard, 'resolveRally'>
 *
 * // Generate resolveUnitsBroken event
 * const event = generateEventFromProcedure(state, 0, 'resolveUnitsBroken');
 * // event is ResolveUnitsBrokenEvent<TBoard, 'resolveUnitsBroken'>
 * ```
 */
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  eventNumber: number,
  effectType: 'completeAttackApply',
): GameEffectEvent<TBoard, 'completeAttackApply'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  eventNumber: number,
  effectType: 'completeCleanupPhase',
): GameEffectEvent<TBoard, 'completeCleanupPhase'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  eventNumber: number,
  effectType: 'completeIssueCommandsPhase',
): GameEffectEvent<TBoard, 'completeIssueCommandsPhase'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  eventNumber: number,
  effectType: 'completeMeleeResolution',
): GameEffectEvent<TBoard, 'completeMeleeResolution'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  eventNumber: number,
  effectType: 'completeMoveCommandersPhase',
): GameEffectEvent<TBoard, 'completeMoveCommandersPhase'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  eventNumber: number,
  effectType: 'completePlayCardsPhase',
): GameEffectEvent<TBoard, 'completePlayCardsPhase'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  eventNumber: number,
  effectType: 'completeRangedAttackCommand',
): GameEffectEvent<TBoard, 'completeRangedAttackCommand'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  eventNumber: number,
  effectType: 'completeResolveMeleePhase',
): GameEffectEvent<TBoard, 'completeResolveMeleePhase'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  eventNumber: number,
  effectType: 'completeUnitMovement',
): GameEffectEvent<TBoard, 'completeUnitMovement'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  eventNumber: number,
  effectType: 'discardPlayedCards',
): GameEffectEvent<TBoard, 'discardPlayedCards'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  eventNumber: number,
  effectType: 'resolveEngageRetreatOption',
): GameEffectEvent<TBoard, 'resolveEngageRetreatOption'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  eventNumber: number,
  effectType: 'resolveFlankEngagement',
): GameEffectEvent<TBoard, 'resolveFlankEngagement'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  eventNumber: number,
  effectType: 'resolveInitiative',
): GameEffectEvent<TBoard, 'resolveInitiative'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  eventNumber: number,
  effectType: 'resolveMelee',
): GameEffectEvent<TBoard, 'resolveMelee'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  eventNumber: number,
  effectType: 'resolveRally',
): GameEffectEvent<TBoard, 'resolveRally'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  eventNumber: number,
  effectType: 'resolveRangedAttack',
): GameEffectEvent<TBoard, 'resolveRangedAttack'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  eventNumber: number,
  effectType: 'resolveRetreat',
): GameEffectEvent<TBoard, 'resolveRetreat'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  eventNumber: number,
  effectType: 'resolveReverse',
): GameEffectEvent<TBoard, 'resolveReverse'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  eventNumber: number,
  effectType: 'resolveRout',
): GameEffectEvent<TBoard, 'resolveRout'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  eventNumber: number,
  effectType: 'resolveUnitsBroken',
): GameEffectEvent<TBoard, 'resolveUnitsBroken'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  eventNumber: number,
  effectType: 'revealCards',
): GameEffectEvent<TBoard, 'revealCards'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  eventNumber: number,
  effectType: 'startEngagement',
): GameEffectEvent<TBoard, 'startEngagement'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  eventNumber: number,
  effectType: 'triggerRoutFromRetreat',
): GameEffectEvent<TBoard, 'triggerRoutFromRetreat'>;
export function generateEventFromProcedure<
  TBoard extends Board,
  TGameEffectType extends GameEffectType,
>(
  state: GameState<TBoard>,
  eventNumber: number,
  effectType: TGameEffectType,
): GameEffectEventUnion<TBoard> {
  switch (effectType) {
    case 'completeAttackApply':
      return generateCompleteAttackApplyEvent(
        state,
        eventNumber,
      ) satisfies GameEffectEvent<TBoard, 'completeAttackApply'>;
    case 'completeCleanupPhase':
      return generateCompleteCleanupPhaseEvent(
        state,
        eventNumber,
      ) satisfies GameEffectEvent<TBoard, 'completeCleanupPhase'>;
    case 'completeIssueCommandsPhase':
      return generateCompleteIssueCommandsPhaseEvent(
        state,
        eventNumber,
      ) satisfies GameEffectEvent<TBoard, 'completeIssueCommandsPhase'>;
    case 'completeMeleeResolution':
      return generateCompleteMeleeResolutionEvent(
        state,
        eventNumber,
      ) satisfies GameEffectEvent<TBoard, 'completeMeleeResolution'>;
    case 'completeMoveCommandersPhase':
      return generateCompleteMoveCommandersPhaseEvent(
        state,
        eventNumber,
      ) satisfies GameEffectEvent<TBoard, 'completeMoveCommandersPhase'>;
    case 'completePlayCardsPhase':
      return generateCompletePlayCardsPhaseEvent(
        state,
        eventNumber,
      ) satisfies GameEffectEvent<TBoard, 'completePlayCardsPhase'>;
    case 'completeRangedAttackCommand':
      return generateCompleteRangedAttackCommandEvent(
        state,
        eventNumber,
      ) satisfies GameEffectEvent<TBoard, 'completeRangedAttackCommand'>;
    case 'completeResolveMeleePhase':
      return generateCompleteResolveMeleePhaseEvent(
        state,
        eventNumber,
      ) satisfies GameEffectEvent<TBoard, 'completeResolveMeleePhase'>;
    case 'completeUnitMovement':
      return generateCompleteUnitMovementEvent(
        state,
        eventNumber,
      ) satisfies GameEffectEvent<TBoard, 'completeUnitMovement'>;
    case 'discardPlayedCards':
      return generateDiscardPlayedCardsEvent(
        state,
        eventNumber,
      ) satisfies GameEffectEvent<TBoard, 'discardPlayedCards'>;
    case 'resolveEngageRetreatOption':
      return generateResolveEngageRetreatOptionEvent(
        state,
        eventNumber,
      ) satisfies GameEffectEvent<TBoard, 'resolveEngageRetreatOption'>;
    case 'resolveFlankEngagement':
      return generateResolveFlankEngagementEvent(
        state,
        eventNumber,
      ) satisfies GameEffectEvent<TBoard, 'resolveFlankEngagement'>;
    case 'resolveInitiative':
      return generateResolveInitiativeEvent(
        state,
        eventNumber,
      ) satisfies GameEffectEvent<TBoard, 'resolveInitiative'>;
    case 'resolveMelee':
      return generateResolveMeleeEvent(
        state,
        eventNumber,
      ) satisfies GameEffectEvent<TBoard, 'resolveMelee'>;
    case 'resolveRally': {
      return generateResolveRallyEvent(
        state,
        eventNumber,
      ) satisfies GameEffectEvent<TBoard, 'resolveRally'>;
    }
    case 'resolveRangedAttack':
      return generateResolveRangedAttackEvent(
        state,
        eventNumber,
      ) satisfies GameEffectEvent<TBoard, 'resolveRangedAttack'>;
    case 'resolveRetreat':
      return generateResolveRetreatEvent(
        state,
        eventNumber,
      ) satisfies GameEffectEvent<TBoard, 'resolveRetreat'>;
    case 'resolveReverse':
      return generateResolveReverseEvent(
        state,
        eventNumber,
      ) satisfies GameEffectEvent<TBoard, 'resolveReverse'>;
    case 'resolveRout':
      return generateResolveRoutEvent(
        state,
        eventNumber,
      ) satisfies GameEffectEvent<TBoard, 'resolveRout'>;
    case 'resolveUnitsBroken': {
      return generateResolveUnitsBrokenEvent(
        state,
        eventNumber,
      ) satisfies GameEffectEvent<TBoard, 'resolveUnitsBroken'>;
    }
    case 'revealCards':
      return generateRevealCardsEvent(
        state,
        eventNumber,
      ) satisfies GameEffectEvent<TBoard, 'revealCards'>;
    case 'startEngagement':
      return generateStartEngagementEvent(
        state,
        eventNumber,
      ) satisfies GameEffectEvent<TBoard, 'startEngagement'>;
    case 'triggerRoutFromRetreat':
      return generateTriggerRoutFromRetreatEvent(
        state,
        eventNumber,
      ) satisfies GameEffectEvent<TBoard, 'triggerRoutFromRetreat'>;

    default: {
      const _exhaustive: never = effectType;
      throw new Error(
        `No procedure exists for effect type: ${_exhaustive as string}`,
      );
    }
  }
}
