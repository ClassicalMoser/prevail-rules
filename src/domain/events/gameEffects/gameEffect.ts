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
import type { Board } from "@entities";
import type { GameEffectType } from "@ruleValues";
import type { AssertExact } from "@utils";
import type { ZodDiscriminatedUnion } from "zod";
import type {
  DiscardPlayedCardsEvent,
  ResolveInitiativeEvent,
  ResolveRallyEvent,
  ResolveUnitsBrokenEvent,
  RevealCardsEvent,
} from "./cards";
import type {
  CompleteCleanupPhaseEvent,
  CompleteIssueCommandsPhaseEvent,
  CompleteMoveCommandersPhaseEvent,
  CompletePlayCardsPhaseEvent,
  CompleteResolveMeleePhaseEvent,
} from "./completePhase";
import type {
  ResolveRetreatEvent,
  ResolveReverseEvent,
  ResolveRoutEvent,
  TriggerRoutFromRetreatEvent,
} from "./defenseResult";
import type {
  CompleteUnitMovementEvent,
  ResolveEngageRetreatOptionEvent,
  ResolveFlankEngagementEvent,
  StartEngagementEvent,
} from "./movement";
import type {
  CompleteAttackApplyEvent,
  CompleteMeleeResolutionEvent,
  CompleteRangedAttackCommandEvent,
  ResolveMeleeEvent,
  ResolveRangedAttackEvent,
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
  completeIssueCommandsPhaseEventSchema,
  completeMoveCommandersPhaseEventSchema,
  completePlayCardsPhaseEventSchema,
  completeResolveMeleePhaseEventSchema,
} from "./completePhase";
import {
  resolveRetreatEventSchema,
  resolveReverseEventSchema,
  resolveRoutEventSchema,
  triggerRoutFromRetreatEventSchema,
} from "./defenseResult";
import {
  completeUnitMovementEventSchema,
  resolveEngageRetreatOptionEventSchema,
  resolveFlankEngagementEventSchema,
  startEngagementEventSchema,
} from "./movement";

import {
  completeAttackApplyEventSchema,
  completeMeleeResolutionEventSchema,
  completeRangedAttackCommandEventSchema,
  resolveMeleeEventSchema,
  resolveRangedAttackEventSchema,
} from "./resolveAttack";

export { gameEffects, type GameEffectType };

/** The schema for a game effect type. */
export const gameEffectTypeSchema: z.ZodType<GameEffectType> = z.enum(gameEffects);

/**
 * Base union of all game effect events (unfiltered).
 * Used internally to create filtered types.
 */
type GameEffectEventUnion<TBoard extends Board> =
  | CompleteAttackApplyEvent<TBoard, "completeAttackApply">
  | CompleteCleanupPhaseEvent<TBoard, "completeCleanupPhase">
  | CompleteIssueCommandsPhaseEvent<TBoard, "completeIssueCommandsPhase">
  | CompleteMoveCommandersPhaseEvent<TBoard, "completeMoveCommandersPhase">
  | CompletePlayCardsPhaseEvent<TBoard, "completePlayCardsPhase">
  | CompleteMeleeResolutionEvent<TBoard, "completeMeleeResolution">
  | CompleteRangedAttackCommandEvent<TBoard, "completeRangedAttackCommand">
  | CompleteResolveMeleePhaseEvent<TBoard, "completeResolveMeleePhase">
  | DiscardPlayedCardsEvent<TBoard, "discardPlayedCards">
  | ResolveEngageRetreatOptionEvent<TBoard, "resolveEngageRetreatOption">
  | ResolveFlankEngagementEvent<TBoard, "resolveFlankEngagement">
  | ResolveInitiativeEvent<TBoard, "resolveInitiative">
  | ResolveMeleeEvent<TBoard, "resolveMelee">
  | ResolveRallyEvent<TBoard, "resolveRally">
  | ResolveRangedAttackEvent<TBoard, "resolveRangedAttack">
  | ResolveRetreatEvent<TBoard, "resolveRetreat">
  | ResolveReverseEvent<TBoard, "resolveReverse">
  | ResolveRoutEvent<TBoard, "resolveRout">
  | ResolveUnitsBrokenEvent<TBoard, "resolveUnitsBroken">
  | RevealCardsEvent<TBoard, "revealCards">
  | CompleteUnitMovementEvent<TBoard, "completeUnitMovement">
  | StartEngagementEvent<TBoard, "startEngagement">
  | TriggerRoutFromRetreatEvent<TBoard, "triggerRoutFromRetreat">;

/**
 * Game effect event type filtered by effect type.
 * Extracts only the event type that matches the specified effectType.
 * This ensures type safety - GameEffectEvent<TBoard, 'resolveRally'> is ONLY ResolveRallyEvent.
 */
export type GameEffectEvent<TBoard extends Board, TGameEffectType extends GameEffectType> = Extract<
  GameEffectEventUnion<TBoard>,
  { effectType: TGameEffectType }
>;

/**
 * Discriminated by `effectType`. Spatial effects nest `boardType` DUs; spatial modules use explicit
 * `z.ZodObject<…>` on variants so nested DUs stay composable under `--isolatedDeclarations`.
 */
type _GameEffectEventDiscriminatedUnion = ZodDiscriminatedUnion<
  readonly [
    typeof completeAttackApplyEventSchema,
    typeof completeCleanupPhaseEventSchema,
    typeof completeIssueCommandsPhaseEventSchema,
    typeof completeMoveCommandersPhaseEventSchema,
    typeof completePlayCardsPhaseEventSchema,
    typeof completeMeleeResolutionEventSchema,
    typeof completeRangedAttackCommandEventSchema,
    typeof completeResolveMeleePhaseEventSchema,
    typeof discardPlayedCardsEventSchema,
    typeof resolveEngageRetreatOptionEventSchema,
    typeof resolveFlankEngagementEventSchema,
    typeof resolveInitiativeEventSchema,
    typeof resolveMeleeEventSchema,
    typeof resolveRallyEventSchema,
    typeof resolveRangedAttackEventSchema,
    typeof resolveRetreatEventSchema,
    typeof resolveReverseEventSchema,
    typeof resolveRoutEventSchema,
    typeof resolveUnitsBrokenEventSchema,
    typeof revealCardsEventSchema,
    typeof completeUnitMovementEventSchema,
    typeof startEngagementEventSchema,
    typeof triggerRoutFromRetreatEventSchema,
  ],
  "effectType"
>;

const _gameEffectEventSchemaObject: _GameEffectEventDiscriminatedUnion = z.discriminatedUnion(
  "effectType",
  [
    completeAttackApplyEventSchema,
    completeCleanupPhaseEventSchema,
    completeIssueCommandsPhaseEventSchema,
    completeMoveCommandersPhaseEventSchema,
    completePlayCardsPhaseEventSchema,
    completeMeleeResolutionEventSchema,
    completeRangedAttackCommandEventSchema,
    completeResolveMeleePhaseEventSchema,
    discardPlayedCardsEventSchema,
    resolveEngageRetreatOptionEventSchema,
    resolveFlankEngagementEventSchema,
    resolveInitiativeEventSchema,
    resolveMeleeEventSchema,
    resolveRallyEventSchema,
    resolveRangedAttackEventSchema,
    resolveRetreatEventSchema,
    resolveReverseEventSchema,
    resolveRoutEventSchema,
    resolveUnitsBrokenEventSchema,
    revealCardsEventSchema,
    completeUnitMovementEventSchema,
    startEngagementEventSchema,
    triggerRoutFromRetreatEventSchema,
  ],
);

type GameEffectEventSchemaType = z.infer<typeof _gameEffectEventSchemaObject>;

/** The schema for a game effect event. */
export const gameEffectEventSchema: typeof _gameEffectEventSchemaObject =
  _gameEffectEventSchemaObject;

const _assertExactGameEffect: AssertExact<
  GameEffectEvent<Board, GameEffectType>,
  GameEffectEventSchemaType
> = true;
