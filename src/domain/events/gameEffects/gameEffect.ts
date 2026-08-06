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
import type { GameEffectType } from '@ruleValues';
import type {
  DiscardPlayedCardsEvent,
  ResolveInitiativeEvent,
  ResolveRallyEvent,
  ResolveUnitsBrokenEvent,
  RevealCardsEvent,
} from './cards';
import type {
  CompleteCleanupPhaseEvent,
  CompleteIssueCommandsPhaseEvent,
  CompleteMoveCommandersPhaseEvent,
  CompletePlayCardsPhaseEvent,
  CompleteResolveMeleePhaseEvent,
} from './completePhase';
import type {
  ResolveRetreatEvent,
  ResolveReverseEvent,
  ResolveRoutEvent,
  TriggerRoutFromRetreatEvent,
} from './defenseResult';
import type {
  CompleteUnitMovementEvent,
  ResolveEngageRetreatOptionEvent,
  ResolveFlankEngagementEvent,
  StartEngagementEvent,
} from './movement';
import type {
  CompleteAttackApplyEvent,
  CompleteMeleeResolutionEvent,
  CompleteRangedAttackCommandEvent,
  ResolveMeleeEvent,
  ResolveRangedAttackEvent,
} from './resolveAttack';
import { gameEffects } from '@ruleValues';
import { z } from 'zod';
import {
  discardPlayedCardsEventSchema,
  resolveInitiativeEventSchema,
  resolveRallyEventSchema,
  resolveUnitsBrokenEventSchema,
  revealCardsEventSchema,
} from './cards';
import {
  completeCleanupPhaseEventSchema,
  completeIssueCommandsPhaseEventSchema,
  completeMoveCommandersPhaseEventSchema,
  completePlayCardsPhaseEventSchema,
  completeResolveMeleePhaseEventSchema,
} from './completePhase';
import {
  completeUnitMovementEventSchema,
  resolveEngageRetreatOptionEventSchema,
  resolveFlankEngagementEventSchema,
  startEngagementEventSchema,
} from './movement';
import {
  completeAttackApplyEventSchema,
  completeMeleeResolutionEventSchema,
  completeRangedAttackCommandEventSchema,
  resolveMeleeEventSchema,
  resolveRangedAttackEventSchema,
} from './resolveAttack';
import {
  resolveRetreatEventSchema,
  resolveReverseEventSchema,
  resolveRoutEventSchema,
  triggerRoutFromRetreatEventSchema,
} from './defenseResult';
import type { AssertExact } from '@utils';

export { gameEffects, type GameEffectType };

/** The schema for a game effect type. */
export const gameEffectTypeSchema: z.ZodType<GameEffectType> =
  z.enum(gameEffects);

/** Base union of all game effect events (unfiltered). */
type GameEffectEventUnion =
  | CompleteAttackApplyEvent
  | CompleteCleanupPhaseEvent
  | CompleteIssueCommandsPhaseEvent
  | CompleteMoveCommandersPhaseEvent
  | CompletePlayCardsPhaseEvent
  | CompleteMeleeResolutionEvent
  | CompleteRangedAttackCommandEvent
  | CompleteResolveMeleePhaseEvent
  | DiscardPlayedCardsEvent
  | ResolveEngageRetreatOptionEvent
  | ResolveFlankEngagementEvent
  | ResolveInitiativeEvent
  | ResolveMeleeEvent
  | ResolveRallyEvent
  | ResolveRangedAttackEvent
  | ResolveRetreatEvent
  | ResolveReverseEvent
  | ResolveRoutEvent
  | ResolveUnitsBrokenEvent
  | RevealCardsEvent
  | CompleteUnitMovementEvent
  | StartEngagementEvent
  | TriggerRoutFromRetreatEvent;

/**
 * Game effect event type filtered by effect type.
 * Extracts only the event type that matches the specified effectType.
 */
export type GameEffectEventOfType<
  TGameEffectType extends GameEffectType = GameEffectType,
> = Extract<GameEffectEventUnion, { effectType: TGameEffectType }>;

export type GameEffectEvent = GameEffectEventOfType;

const _gameEffectEventSchemaObject = z.discriminatedUnion('effectType', [
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
]);

type GameEffectEventSchemaType = z.infer<typeof _gameEffectEventSchemaObject>;

const _assertExactGameEffect: AssertExact<
  GameEffectEvent,
  GameEffectEventSchemaType
> = true;

export const gameEffectEventSchema: z.ZodType<GameEffectEvent> =
  _gameEffectEventSchemaObject;
