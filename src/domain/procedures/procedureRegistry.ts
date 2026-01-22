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
import { generateResolveEngagementTypeEvent } from './generateResolveEngagementTypeEvent';
import { generateResolveEngageRetreatOptionEvent } from './generateResolveEngageRetreatOptionEvent';
import { generateResolveInitiativeEvent } from './generateResolveInitiativeEvent';
import { generateResolveRallyEvent } from './generateResolveRallyEvent';
import { generateResolveReverseEvent } from './generateResolveReverseEvent';
import { generateResolveUnitsBrokenEvent } from './generateResolveUnitsBrokenEvent';
import { generateRevealCardsEvent } from './generateRevealCardsEvent';

// Import the unfiltered union type for the implementation signature
type GameEffectEventUnion<TBoard extends Board> = GameEffectEvent<
  TBoard,
  GameEffectType
>;

/**
 * Generates a game effect event using the appropriate procedure
 * based on the effect type.
 * Procedures are non-deterministic (they generate randomness);
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
  effectType: 'resolveRally',
): GameEffectEvent<TBoard, 'resolveRally'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'resolveUnitsBroken',
): GameEffectEvent<TBoard, 'resolveUnitsBroken'>;
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
  effectType: 'completeMoveCommandersPhase',
): GameEffectEvent<TBoard, 'completeMoveCommandersPhase'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'completePlayCardsPhase',
): GameEffectEvent<TBoard, 'completePlayCardsPhase'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'completeResolveMeleePhase',
): GameEffectEvent<TBoard, 'completeResolveMeleePhase'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'discardPlayedCards',
): GameEffectEvent<TBoard, 'discardPlayedCards'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'resolveInitiative',
): GameEffectEvent<TBoard, 'resolveInitiative'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'revealCards',
): GameEffectEvent<TBoard, 'revealCards'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'completeAttackApply',
): GameEffectEvent<TBoard, 'completeAttackApply'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'completeMeleeResolution',
): GameEffectEvent<TBoard, 'completeMeleeResolution'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'completeRangedAttackCommand',
): GameEffectEvent<TBoard, 'completeRangedAttackCommand'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'completeUnitMovement',
): GameEffectEvent<TBoard, 'completeUnitMovement'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'resolveEngageRetreatOption',
): GameEffectEvent<TBoard, 'resolveEngageRetreatOption'>;
export function generateEventFromProcedure<TBoard extends Board>(
  state: GameState<TBoard>,
  effectType: 'resolveReverse',
): GameEffectEvent<TBoard, 'resolveReverse'>;
export function generateEventFromProcedure<
  TBoard extends Board,
  TGameEffectType extends GameEffectType,
>(
  state: GameState<TBoard>,
  effectType: TGameEffectType,
): GameEffectEventUnion<TBoard> {
  switch (effectType) {
    case 'resolveRally': {
      return generateResolveRallyEvent(state) satisfies GameEffectEvent<
        TBoard,
        'resolveRally'
      >;
    }
    case 'resolveUnitsBroken': {
      return generateResolveUnitsBrokenEvent(state) satisfies GameEffectEvent<
        TBoard,
        'resolveUnitsBroken'
      >;
    }
    case 'completeCleanupPhase':
      return generateCompleteCleanupPhaseEvent(state) satisfies GameEffectEvent<
        TBoard,
        'completeCleanupPhase'
      >;
    case 'completeIssueCommandsPhase':
      return generateCompleteIssueCommandsPhaseEvent(
        state,
      ) satisfies GameEffectEvent<TBoard, 'completeIssueCommandsPhase'>;
    case 'completeMoveCommandersPhase':
      return generateCompleteMoveCommandersPhaseEvent(
        state,
      ) satisfies GameEffectEvent<TBoard, 'completeMoveCommandersPhase'>;
    case 'completePlayCardsPhase':
      return generateCompletePlayCardsPhaseEvent(
        state,
      ) satisfies GameEffectEvent<TBoard, 'completePlayCardsPhase'>;
    case 'completeResolveMeleePhase':
      return generateCompleteResolveMeleePhaseEvent(
        state,
      ) satisfies GameEffectEvent<TBoard, 'completeResolveMeleePhase'>;
    case 'discardPlayedCards':
      return generateDiscardPlayedCardsEvent(state) satisfies GameEffectEvent<
        TBoard,
        'discardPlayedCards'
      >;
    case 'resolveInitiative':
      return generateResolveInitiativeEvent(state) satisfies GameEffectEvent<
        TBoard,
        'resolveInitiative'
      >;
    case 'revealCards':
      return generateRevealCardsEvent(state) satisfies GameEffectEvent<
        TBoard,
        'revealCards'
      >;
    case 'completeAttackApply':
      return generateCompleteAttackApplyEvent(state) satisfies GameEffectEvent<
        TBoard,
        'completeAttackApply'
      >;
    case 'completeMeleeResolution':
      return generateCompleteMeleeResolutionEvent(
        state,
      ) satisfies GameEffectEvent<TBoard, 'completeMeleeResolution'>;
    case 'completeRangedAttackCommand':
      return generateCompleteRangedAttackCommandEvent(
        state,
      ) satisfies GameEffectEvent<TBoard, 'completeRangedAttackCommand'>;
    case 'completeUnitMovement':
      return generateCompleteUnitMovementEvent(state) satisfies GameEffectEvent<
        TBoard,
        'completeUnitMovement'
      >;
    case 'resolveEngagementType':
      return generateResolveEngagementTypeEvent(
        state,
      ) satisfies GameEffectEvent<TBoard, 'resolveEngagementType'>;
    case 'resolveEngageRetreatOption':
      return generateResolveEngageRetreatOptionEvent(
        state,
      ) satisfies GameEffectEvent<TBoard, 'resolveEngageRetreatOption'>;
    case 'resolveReverse':
      return generateResolveReverseEvent(state) satisfies GameEffectEvent<
        TBoard,
        'resolveReverse'
      >;
    case 'resolveFlankEngagement':
    case 'startEngagement':
    case 'resolveMelee':
    case 'resolveRangedAttack':
    case 'resolveRetreat':
    case 'resolveRout':
      throw new Error(`No procedure exists for effect type: ${effectType}`);

    default: {
      const _exhaustive: never = effectType;
      throw new Error(
        `No procedure exists for effect type: ${_exhaustive as string}`,
      );
    }
  }
}
