/**
 * All **game effect** payloads (`eventType: 'gameEffect'`), discriminated by `effectType`.
 *
 * ## Trust model (with apply handlers)
 * See `src/domain/transforms/stateTransitions/applyEffects/README.md`:
 * procedures build events from full state; **apply** trusts the log and maps payload + state to
 * the next state. Extra fields here usually mean “don’t re-scan the board / don’t guess which
 * subtree” when applying.
 *
 * ## Typing
 * Per-effect modules define a manual interface, a private Zod object, `AssertExact` tying
 * `z.infer` to that interface, and an exported schema typed for `isolatedDeclarations`.
 *
 * ## `gameEffects` import
 * From `@ruleValues/gameEffectTypes` only — not `@entities` (circular init with this file).
 */
import type { Board, LargeBoard, SmallBoard, StandardBoard } from "@entities";
import type { GameEffectType } from "@ruleValues";
import type {
  DiscardPlayedCardsEvent,
  ResolveInitiativeEvent,
  ResolveRallyEvent,
  ResolveUnitsBrokenEvent,
  RevealCardsEvent,
} from "./cards";
import type {
  CompleteCleanupPhaseEvent,
  CompleteIssueCommandsPhaseEventForBoard,
  CompleteMoveCommandersPhaseEvent,
  CompletePlayCardsPhaseEvent,
  CompleteResolveMeleePhaseEvent,
} from "./completePhase";
import type {
  ResolveRetreatEventForBoard,
  ResolveReverseEventForBoard,
  ResolveRoutEvent,
  TriggerRoutFromRetreatEvent,
} from "./defenseResult";
import type {
  CompleteUnitMovementEvent,
  ResolveEngageRetreatOptionEvent,
  ResolveFlankEngagementEventForBoard,
  StartEngagementEventForBoard,
} from "./movement";
import type {
  CompleteAttackApplyEvent,
  CompleteMeleeResolutionEvent,
  CompleteRangedAttackCommandEvent,
  ResolveMeleeEventForBoard,
  ResolveRangedAttackEventForBoard,
} from "./resolveAttack";
import { gameEffects } from "@ruleValues";
import { z } from "zod";
import {
  discardPlayedCardsEventSchema,
  resolveInitiativeEventSchema,
  resolveRallyEventSchema,
  resolveUnitsBrokenEventSchema,
  revealCardsEventSchema,
} from "./cards";
import {
  completeCleanupPhaseEventSchema,
  completeMoveCommandersPhaseEventSchema,
  completePlayCardsPhaseEventSchema,
  completeResolveMeleePhaseEventSchema,
  largeCompleteIssueCommandsPhaseEventSchema,
  smallCompleteIssueCommandsPhaseEventSchema,
  standardCompleteIssueCommandsPhaseEventSchema,
} from "./completePhase";
import {
  completeUnitMovementEventSchema,
  largeResolveFlankEngagementEventSchema,
  largeStartEngagementEventSchema,
  resolveEngageRetreatOptionEventSchema,
  smallResolveFlankEngagementEventSchema,
  smallStartEngagementEventSchema,
  standardResolveFlankEngagementEventSchema,
  standardStartEngagementEventSchema,
} from "./movement";

import {
  completeAttackApplyEventSchema,
  completeMeleeResolutionEventSchema,
  completeRangedAttackCommandEventSchema,
  largeResolveMeleeEventSchema,
  largeResolveRangedAttackEventSchema,
  smallResolveMeleeEventSchema,
  smallResolveRangedAttackEventSchema,
  standardResolveMeleeEventSchema,
  standardResolveRangedAttackEventSchema,
} from "./resolveAttack";
import {
  largeResolveRetreatEventSchema,
  largeResolveReverseEventSchema,
  resolveRoutEventSchema,
  smallResolveRetreatEventSchema,
  smallResolveReverseEventSchema,
  standardResolveRetreatEventSchema,
  standardResolveReverseEventSchema,
  triggerRoutFromRetreatEventSchema,
} from "./defenseResult";
import type { AssertExact } from "@utils";

export { gameEffects, type GameEffectType };

/** The schema for a game effect type. */
export const gameEffectTypeSchema: z.ZodType<GameEffectType> = z.enum(gameEffects);

/**
 * Base union of all game effect events (unfiltered).
 * Used internally to create filtered types.
 */
type GameEffectEventUnionForBoard<TBoard extends Board> =
  | CompleteAttackApplyEvent
  | CompleteCleanupPhaseEvent
  | CompleteIssueCommandsPhaseEventForBoard<TBoard>
  | CompleteMoveCommandersPhaseEvent
  | CompletePlayCardsPhaseEvent
  | CompleteMeleeResolutionEvent
  | CompleteRangedAttackCommandEvent
  | CompleteResolveMeleePhaseEvent
  | DiscardPlayedCardsEvent
  | ResolveEngageRetreatOptionEvent
  | ResolveFlankEngagementEventForBoard<TBoard>
  | ResolveInitiativeEvent
  | ResolveMeleeEventForBoard<TBoard>
  | ResolveRallyEvent
  | ResolveRangedAttackEventForBoard<TBoard>
  | ResolveRetreatEventForBoard<TBoard>
  | ResolveReverseEventForBoard<TBoard>
  | ResolveRoutEvent
  | ResolveUnitsBrokenEvent
  | RevealCardsEvent
  | CompleteUnitMovementEvent
  | StartEngagementEventForBoard<TBoard>
  | TriggerRoutFromRetreatEvent;

/**
 * Game effect event type filtered by effect type.
 * Extracts only the event type that matches the specified effectType.
 * This ensures type safety - GameEffectEvent<TBoard, 'resolveRally'> is ONLY ResolveRallyEvent.
 */
export type GameEffectEventForBoard<
  TBoard extends Board,
  TGameEffectType extends GameEffectType = GameEffectType,
> = Extract<GameEffectEventUnionForBoard<TBoard>, { effectType: TGameEffectType }>;

export type GameEffectEvent =
  | GameEffectEventForBoard<SmallBoard>
  | GameEffectEventForBoard<StandardBoard>
  | GameEffectEventForBoard<LargeBoard>;

const _smallGameEffectEventSchemaObject = z.discriminatedUnion("effectType", [
  completeAttackApplyEventSchema,
  completeCleanupPhaseEventSchema,
  smallCompleteIssueCommandsPhaseEventSchema,
  completeMoveCommandersPhaseEventSchema,
  completePlayCardsPhaseEventSchema,
  completeMeleeResolutionEventSchema,
  completeRangedAttackCommandEventSchema,
  completeResolveMeleePhaseEventSchema,
  discardPlayedCardsEventSchema,
  resolveEngageRetreatOptionEventSchema,
  smallResolveFlankEngagementEventSchema,
  resolveInitiativeEventSchema,
  smallResolveMeleeEventSchema,
  resolveRallyEventSchema,
  smallResolveRangedAttackEventSchema,
  smallResolveRetreatEventSchema,
  smallResolveReverseEventSchema,
  resolveRoutEventSchema,
  resolveUnitsBrokenEventSchema,
  revealCardsEventSchema,
  completeUnitMovementEventSchema,
  smallStartEngagementEventSchema,
  triggerRoutFromRetreatEventSchema,
]);

type SmallGameEffectEventSchemaType = z.infer<typeof _smallGameEffectEventSchemaObject>;

const _assertExactSmallGameEffect: AssertExact<
  GameEffectEventForBoard<SmallBoard>,
  SmallGameEffectEventSchemaType
> = true;

export const smallGameEffectEventSchema: z.ZodType<GameEffectEventForBoard<SmallBoard>> =
  _smallGameEffectEventSchemaObject;

const _standardGameEffectEventSchemaObject = z.discriminatedUnion("effectType", [
  completeAttackApplyEventSchema,
  completeCleanupPhaseEventSchema,
  standardCompleteIssueCommandsPhaseEventSchema,
  completeMoveCommandersPhaseEventSchema,
  completePlayCardsPhaseEventSchema,
  completeMeleeResolutionEventSchema,
  completeRangedAttackCommandEventSchema,
  completeResolveMeleePhaseEventSchema,
  discardPlayedCardsEventSchema,
  resolveEngageRetreatOptionEventSchema,
  standardResolveFlankEngagementEventSchema,
  resolveInitiativeEventSchema,
  standardResolveMeleeEventSchema,
  resolveRallyEventSchema,
  standardResolveRangedAttackEventSchema,
  standardResolveRetreatEventSchema,
  standardResolveReverseEventSchema,
  resolveRoutEventSchema,
  resolveUnitsBrokenEventSchema,
  revealCardsEventSchema,
  completeUnitMovementEventSchema,
  standardStartEngagementEventSchema,
  triggerRoutFromRetreatEventSchema,
]);

type StandardGameEffectEventSchemaType = z.infer<typeof _standardGameEffectEventSchemaObject>;

const _assertExactStandardGameEffect: AssertExact<
  GameEffectEventForBoard<StandardBoard>,
  StandardGameEffectEventSchemaType
> = true;

export const standardGameEffectEventSchema: z.ZodType<GameEffectEventForBoard<StandardBoard>> =
  _standardGameEffectEventSchemaObject;

const _largeGameEffectEventSchemaObject = z.discriminatedUnion("effectType", [
  completeAttackApplyEventSchema,
  completeCleanupPhaseEventSchema,
  largeCompleteIssueCommandsPhaseEventSchema,
  completeMoveCommandersPhaseEventSchema,
  completePlayCardsPhaseEventSchema,
  completeMeleeResolutionEventSchema,
  completeRangedAttackCommandEventSchema,
  completeResolveMeleePhaseEventSchema,
  discardPlayedCardsEventSchema,
  resolveEngageRetreatOptionEventSchema,
  largeResolveFlankEngagementEventSchema,
  resolveInitiativeEventSchema,
  largeResolveMeleeEventSchema,
  resolveRallyEventSchema,
  largeResolveRangedAttackEventSchema,
  largeResolveRetreatEventSchema,
  largeResolveReverseEventSchema,
  resolveRoutEventSchema,
  resolveUnitsBrokenEventSchema,
  revealCardsEventSchema,
  completeUnitMovementEventSchema,
  largeStartEngagementEventSchema,
  triggerRoutFromRetreatEventSchema,
]);

type LargeGameEffectEventSchemaType = z.infer<typeof _largeGameEffectEventSchemaObject>;

const _assertExactLargeGameEffect: AssertExact<
  GameEffectEventForBoard<LargeBoard>,
  LargeGameEffectEventSchemaType
> = true;

export const largeGameEffectEventSchema: z.ZodType<GameEffectEventForBoard<LargeBoard>> =
  _largeGameEffectEventSchemaObject;

export const gameEffectEventSchema: z.ZodType<GameEffectEvent> = z.union([
  smallGameEffectEventSchema,
  standardGameEffectEventSchema,
  largeGameEffectEventSchema,
]);
