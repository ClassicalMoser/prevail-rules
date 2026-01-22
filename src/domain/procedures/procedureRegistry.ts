import type { Board, GameState } from '@entities';
import type { GameEffectEvent, GameEffectType } from '@events';
import { generateCompleteAttackApplyEvent } from './generateCompleteAttackApplyEvent';
import { generateCompleteCleanupPhaseEvent } from './generateCompleteCleanupPhaseEvent';
import { generateCompleteIssueCommandsPhaseEvent } from './generateCompleteIssueCommandsPhaseEvent';
import { generateCompleteMeleeResolutionEvent } from './generateCompleteMeleeResolutionEvent';
import { generateCompleteMoveCommandersPhaseEvent } from './generateCompleteMoveCommandersPhaseEvent';
import { generateCompletePlayCardsPhaseEvent } from './generateCompletePlayCardsPhaseEvent';
import { generateCompleteRangedAttackCommandEvent } from './generateCompleteRangedAttackCommandEvent';
import { generateCompleteResolveMeleePhaseEvent } from './generateCompleteResolveMeleePhaseEvent';
import { generateCompleteUnitMovementEvent } from './generateCompleteUnitMovementEvent';
import { generateDiscardPlayedCardsEvent } from './generateDiscardPlayedCardsEvent';
import { generateResolveEngageRetreatOptionEvent } from './generateResolveEngageRetreatOptionEvent';
import { generateResolveFlankEngagementEvent } from './generateResolveFlankEngagementEvent';
import { generateResolveInitiativeEvent } from './generateResolveInitiativeEvent';
import { generateResolveMeleeEvent } from './generateResolveMeleeEvent';
import { generateResolveRallyEvent } from './generateResolveRallyEvent';
import { generateResolveRangedAttackEvent } from './generateResolveRangedAttackEvent';
import { generateResolveRetreatEvent } from './generateResolveRetreatEvent';
import { generateResolveReverseEvent } from './generateResolveReverseEvent';
import { generateResolveRoutEvent } from './generateResolveRoutEvent';
import { generateResolveUnitsBrokenEvent } from './generateResolveUnitsBrokenEvent';
import { generateRevealCardsEvent } from './generateRevealCardsEvent';
import { generateStartEngagementEvent } from './generateStartEngagementEvent';
import { generateTriggerRoutFromRetreatEvent } from './generateTriggerRoutFromRetreatEvent';

// Import the unfiltered union type for the implementation signature
type GameEffectEventUnion<TBoard extends Board> = GameEffectEvent<
  TBoard,
  GameEffectType
>;

/**
 * Generates a game effect event using the appropriate procedure
 * based on the effect type.
 * Procedures are non-deterministic (some generate randomness);
 * the event (with results) is what makes it replayable.
 * TypeScript will enforce the correct return types based on the effect type.
 *
 * @param state - The current game state
 * @param effectType - The type of game effect to generate
 * @returns The generated game effect event with the specific type for the effect
 * @throws Error if the effect type doesn't have a procedure
 *
 * @example
 * ```typescript
 * // Generate resolveRally event (randomly selects card)
 * const event = generateEventFromProcedure(state, 'resolveRally');
 * // event is ResolveRallyEvent<TBoard, 'resolveRally'>
 *
 * // Generate resolveUnitsBroken event
 * const event = generateEventFromProcedure(state, 'resolveUnitsBroken');
 * // event is ResolveUnitsBrokenEvent<TBoard, 'resolveUnitsBroken'>
 * ```
 */
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'completeAttackApply',
): GameEffectEvent<TBoard, 'completeAttackApply'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'completeCleanupPhase',
): GameEffectEvent<TBoard, 'completeCleanupPhase'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'completeIssueCommandsPhase',
): GameEffectEvent<TBoard, 'completeIssueCommandsPhase'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'completeMeleeResolution',
): GameEffectEvent<TBoard, 'completeMeleeResolution'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'completeMoveCommandersPhase',
): GameEffectEvent<TBoard, 'completeMoveCommandersPhase'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'completePlayCardsPhase',
): GameEffectEvent<TBoard, 'completePlayCardsPhase'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'completeRangedAttackCommand',
): GameEffectEvent<TBoard, 'completeRangedAttackCommand'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'completeResolveMeleePhase',
): GameEffectEvent<TBoard, 'completeResolveMeleePhase'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'completeUnitMovement',
): GameEffectEvent<TBoard, 'completeUnitMovement'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'discardPlayedCards',
): GameEffectEvent<TBoard, 'discardPlayedCards'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'resolveEngageRetreatOption',
): GameEffectEvent<TBoard, 'resolveEngageRetreatOption'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'resolveFlankEngagement',
): GameEffectEvent<TBoard, 'resolveFlankEngagement'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'resolveInitiative',
): GameEffectEvent<TBoard, 'resolveInitiative'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'resolveMelee',
): GameEffectEvent<TBoard, 'resolveMelee'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'resolveRally',
): GameEffectEvent<TBoard, 'resolveRally'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'resolveRangedAttack',
): GameEffectEvent<TBoard, 'resolveRangedAttack'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'resolveRetreat',
): GameEffectEvent<TBoard, 'resolveRetreat'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'resolveReverse',
): GameEffectEvent<TBoard, 'resolveReverse'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'resolveRout',
): GameEffectEvent<TBoard, 'resolveRout'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'resolveUnitsBroken',
): GameEffectEvent<TBoard, 'resolveUnitsBroken'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'revealCards',
): GameEffectEvent<TBoard, 'revealCards'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'startEngagement',
): GameEffectEvent<TBoard, 'startEngagement'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'triggerRoutFromRetreat',
): GameEffectEvent<TBoard, 'triggerRoutFromRetreat'>;
export function generateEventFromProcedure<
  TBoard extends Board,
  TGameEffectType extends GameEffectType,
>(
  state: GameState<TBoard>,
  effectType: TGameEffectType,
): GameEffectEventUnion<TBoard> {
  switch (effectType) {
    case 'completeAttackApply':
      return generateCompleteAttackApplyEvent(state) satisfies GameEffectEvent<
        TBoard,
        'completeAttackApply'
      >;
    case 'completeCleanupPhase':
      return generateCompleteCleanupPhaseEvent(state) satisfies GameEffectEvent<
        TBoard,
        'completeCleanupPhase'
      >;
    case 'completeIssueCommandsPhase':
      return generateCompleteIssueCommandsPhaseEvent(
        state,
      ) satisfies GameEffectEvent<TBoard, 'completeIssueCommandsPhase'>;
    case 'completeMeleeResolution':
      return generateCompleteMeleeResolutionEvent(
        state,
      ) satisfies GameEffectEvent<TBoard, 'completeMeleeResolution'>;
    case 'completeMoveCommandersPhase':
      return generateCompleteMoveCommandersPhaseEvent(
        state,
      ) satisfies GameEffectEvent<TBoard, 'completeMoveCommandersPhase'>;
    case 'completePlayCardsPhase':
      return generateCompletePlayCardsPhaseEvent(
        state,
      ) satisfies GameEffectEvent<TBoard, 'completePlayCardsPhase'>;
    case 'completeRangedAttackCommand':
      return generateCompleteRangedAttackCommandEvent(
        state,
      ) satisfies GameEffectEvent<TBoard, 'completeRangedAttackCommand'>;
    case 'completeResolveMeleePhase':
      return generateCompleteResolveMeleePhaseEvent(
        state,
      ) satisfies GameEffectEvent<TBoard, 'completeResolveMeleePhase'>;
    case 'completeUnitMovement':
      return generateCompleteUnitMovementEvent(state) satisfies GameEffectEvent<
        TBoard,
        'completeUnitMovement'
      >;
    case 'discardPlayedCards':
      return generateDiscardPlayedCardsEvent(state) satisfies GameEffectEvent<
        TBoard,
        'discardPlayedCards'
      >;
    case 'resolveEngageRetreatOption':
      return generateResolveEngageRetreatOptionEvent(
        state,
      ) satisfies GameEffectEvent<TBoard, 'resolveEngageRetreatOption'>;
    case 'resolveFlankEngagement':
      return generateResolveFlankEngagementEvent(
        state,
      ) satisfies GameEffectEvent<TBoard, 'resolveFlankEngagement'>;
    case 'resolveInitiative':
      return generateResolveInitiativeEvent(state) satisfies GameEffectEvent<
        TBoard,
        'resolveInitiative'
      >;
    case 'resolveMelee':
      return generateResolveMeleeEvent(state) satisfies GameEffectEvent<
        TBoard,
        'resolveMelee'
      >;
    case 'resolveRally': {
      return generateResolveRallyEvent(state) satisfies GameEffectEvent<
        TBoard,
        'resolveRally'
      >;
    }
    case 'resolveRangedAttack':
      return generateResolveRangedAttackEvent(state) satisfies GameEffectEvent<
        TBoard,
        'resolveRangedAttack'
      >;
    case 'resolveRetreat':
      return generateResolveRetreatEvent(state) satisfies GameEffectEvent<
        TBoard,
        'resolveRetreat'
      >;
    case 'resolveReverse':
      return generateResolveReverseEvent(state) satisfies GameEffectEvent<
        TBoard,
        'resolveReverse'
      >;
    case 'resolveRout':
      return generateResolveRoutEvent(state) satisfies GameEffectEvent<
        TBoard,
        'resolveRout'
      >;
    case 'resolveUnitsBroken': {
      return generateResolveUnitsBrokenEvent(state) satisfies GameEffectEvent<
        TBoard,
        'resolveUnitsBroken'
      >;
    }
    case 'revealCards':
      return generateRevealCardsEvent(state) satisfies GameEffectEvent<
        TBoard,
        'revealCards'
      >;
    case 'startEngagement':
      return generateStartEngagementEvent(state) satisfies GameEffectEvent<
        TBoard,
        'startEngagement'
      >;
    case 'triggerRoutFromRetreat':
      return generateTriggerRoutFromRetreatEvent(
        state,
      ) satisfies GameEffectEvent<TBoard, 'triggerRoutFromRetreat'>;

    default: {
      const _exhaustive: never = effectType;
      throw new Error(
        `No procedure exists for effect type: ${_exhaustive as string}`,
      );
    }
  }
}
