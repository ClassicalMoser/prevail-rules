/**
 * All **game effect** payloads (`eventType: 'gameEffect'`), discriminated by `effectType`.
 *
 * ## Trust model (with apply handlers)
 * See `src/domain/transforms/stateTransitions/applyEffects/README.md`:
 * TODO(misleading): a "see <document>" pointer, which STYLE.md rules out; the trust model it points to should be said here or named by code.
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
  GameOverEvent,
  ResolveInitiativeEvent,
  ResolveRallyEvent,
  RevealCardsEvent,
} from './cards';
import type {
  RoundEndEvent,
  CompleteIssueCommandsPhaseEvent,
  CompleteIssuingCommandsEvent,
  SkipLostCommanderMoveEvent,
  CompleteMoveCommandersPhaseEvent,
  CompletePlayCardsPhaseEvent,
  CompleteResolveMeleePhaseEvent,
} from './completePhase';
import type {
  OpenRetreatFromAttackApplyEvent,
  OpenReverseFromAttackApplyEvent,
  OpenRoutFromAttackApplyEvent,
  ResolveRetreatEvent,
  ResolveReverseEvent,
  ResolveRoutEvent,
  TriggerRoutFromRetreatEvent,
} from './defenseResult';
import type {
  CompleteMovementCommandEvent,
  CompleteUnitMovementEvent,
  OpenRetreatFromEngagementEvent,
  ResolveEngageRetreatOptionEvent,
  ResolveFlankEngagementEvent,
  StartEngagementEvent,
} from './movement';
import type {
  CompleteAttackApplyEvent,
  CompleteMeleeResolutionEvent,
  CompleteRangedAttackCommandEvent,
  CompleteRangedAttackEvent,
  ResolveMeleeEvent,
  ResolveRangedAttackEvent,
} from './resolveAttack';
import { gameEffects } from '@ruleValues';
import { z } from 'zod';
import {
  discardPlayedCardsEventSchema,
  gameOverEventSchema,
  resolveInitiativeEventSchema,
  resolveRallyEventSchema,
  revealCardsEventSchema,
} from './cards';
import {
  roundEndEventSchema,
  completeIssueCommandsPhaseEventSchema,
  completeIssuingCommandsEventSchema,
  skipLostCommanderMoveEventSchema,
  completeMoveCommandersPhaseEventSchema,
  completePlayCardsPhaseEventSchema,
  completeResolveMeleePhaseEventSchema,
} from './completePhase';
import {
  completeMovementCommandEventSchema,
  completeUnitMovementEventSchema,
  openRetreatFromEngagementEventSchema,
  resolveEngageRetreatOptionEventSchema,
  resolveFlankEngagementEventSchema,
  startEngagementEventSchema,
} from './movement';
import {
  completeAttackApplyEventSchema,
  completeMeleeResolutionEventSchema,
  completeRangedAttackCommandEventSchema,
  completeRangedAttackEventSchema,
  resolveMeleeEventSchema,
  resolveRangedAttackEventSchema,
} from './resolveAttack';
import {
  openRetreatFromAttackApplyEventSchema,
  openReverseFromAttackApplyEventSchema,
  openRoutFromAttackApplyEventSchema,
  resolveRetreatEventSchema,
  resolveReverseEventSchema,
  resolveRoutEventSchema,
  triggerRoutFromRetreatEventSchema,
} from './defenseResult';
import type { AssertExact } from '@utils';

// The list of effect types lives in ruleValues; @events offers it beside the effects it names.
export { gameEffects, type GameEffectType };

/** The schema for a game effect type. */
export const gameEffectTypeSchema: z.ZodType<GameEffectType> =
  z.enum(gameEffects);

/**
 * Any game effect: something the game records as the rules require, not a
 * decision a player makes.
 */
export type GameEffectEvent =
  | CompleteAttackApplyEvent
  | RoundEndEvent
  | CompleteIssueCommandsPhaseEvent
  | CompleteIssuingCommandsEvent
  | SkipLostCommanderMoveEvent
  | CompleteMoveCommandersPhaseEvent
  | CompleteMovementCommandEvent
  | CompletePlayCardsPhaseEvent
  | CompleteMeleeResolutionEvent
  | CompleteRangedAttackCommandEvent
  | CompleteRangedAttackEvent
  | CompleteResolveMeleePhaseEvent
  | DiscardPlayedCardsEvent
  | GameOverEvent
  | OpenRetreatFromAttackApplyEvent
  | OpenRetreatFromEngagementEvent
  | OpenReverseFromAttackApplyEvent
  | OpenRoutFromAttackApplyEvent
  | ResolveEngageRetreatOptionEvent
  | ResolveFlankEngagementEvent
  | ResolveInitiativeEvent
  | ResolveMeleeEvent
  | ResolveRallyEvent
  | ResolveRangedAttackEvent
  | ResolveRetreatEvent
  | ResolveReverseEvent
  | ResolveRoutEvent
  | RevealCardsEvent
  | CompleteUnitMovementEvent
  | StartEngagementEvent
  | TriggerRoutFromRetreatEvent;

const _gameEffectEventSchemaObject = z.discriminatedUnion('effectType', [
  completeAttackApplyEventSchema,
  roundEndEventSchema,
  completeIssueCommandsPhaseEventSchema,
  completeIssuingCommandsEventSchema,
  skipLostCommanderMoveEventSchema,
  completeMoveCommandersPhaseEventSchema,
  completeMovementCommandEventSchema,
  completePlayCardsPhaseEventSchema,
  completeMeleeResolutionEventSchema,
  completeRangedAttackCommandEventSchema,
  completeRangedAttackEventSchema,
  completeResolveMeleePhaseEventSchema,
  discardPlayedCardsEventSchema,
  gameOverEventSchema,
  openRetreatFromAttackApplyEventSchema,
  openRetreatFromEngagementEventSchema,
  openReverseFromAttackApplyEventSchema,
  openRoutFromAttackApplyEventSchema,
  resolveEngageRetreatOptionEventSchema,
  resolveFlankEngagementEventSchema,
  resolveInitiativeEventSchema,
  resolveMeleeEventSchema,
  resolveRallyEventSchema,
  resolveRangedAttackEventSchema,
  resolveRetreatEventSchema,
  resolveReverseEventSchema,
  resolveRoutEventSchema,
  revealCardsEventSchema,
  completeUnitMovementEventSchema,
  startEngagementEventSchema,
  triggerRoutFromRetreatEventSchema,
]);
type GameEffectEventSchemaType = z.infer<typeof _gameEffectEventSchemaObject>;

/** The schema accepts exactly the effects the union names. */
const _assertExactGameEffect: AssertExact<
  GameEffectEvent,
  GameEffectEventSchemaType
> = true;

/** The schema for any game effect. */
export const gameEffectEventSchema: z.ZodType<GameEffectEvent> =
  _gameEffectEventSchemaObject;

/** Every effect type the list names has an event, and no other. */
const _assertEffectTypesMatchEvents: AssertExact<
  GameEffectType,
  GameEffectEvent['effectType']
> = true;
