/**
 * All **game effect** payloads (`eventType: 'gameEffect'`), discriminated by `effectType`.
 *
 * ## Trust model
 * A game effect is what the game does when no player is asked. A procedure
 * builds it from the whole state (`generateEventFromProcedure`), and that is
 * where its rule is decided: what an attack measured, the retreats a unit may
 * make, the card a rally burns. The event records that answer, so replaying
 * the game's stream gives the same game without deciding anything again.
 *
 * Applying an effect trusts it. The apply (`applyGameEffectEvent`) reads where
 * the game is, which slot the effect writes, and where a named unit stands,
 * then carries out the event's fixed consequences without re-checking the rule.
 *
 * An event carries only what the state does not already hold. It does not name
 * the slot it writes: the apply asks the same `@queries` reader the procedure
 * used, so the event and the state cannot disagree.
 *
 * ## Typing
 * Per-effect modules define a manual interface, a private Zod object, {@link AssertExact} tying
 * `z.infer` to that interface, and an exported schema typed for `isolatedDeclarations`.
 *
 * ## {@link gameEffects} import
 * From `@ruleValues/gameEffectTypes` only — not `@entities` (circular init with this file).
 */
import type { GameEffectType } from '@ruleValues';
import type {
  CardsLeavePlayEvent,
  GameOverEvent,
  ResolveInitiativeEvent,
  ResolveRallyEvent,
  RevealCardsEvent,
} from './cards';
import type {
  RoundEndEvent,
  CompleteIssueCommandsPhaseEvent,
  SkipLostCommanderMoveEvent,
  CompleteMoveCommandersPhaseEvent,
  CompletePlayCardsPhaseEvent,
  CompleteResolveMeleePhaseEvent,
} from './sequencing';
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
  cardsLeavePlayEventSchema,
  gameOverEventSchema,
  resolveInitiativeEventSchema,
  resolveRallyEventSchema,
  revealCardsEventSchema,
} from './cards';
import {
  roundEndEventSchema,
  completeIssueCommandsPhaseEventSchema,
  skipLostCommanderMoveEventSchema,
  completeMoveCommandersPhaseEventSchema,
  completePlayCardsPhaseEventSchema,
  completeResolveMeleePhaseEventSchema,
} from './sequencing';
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
  | SkipLostCommanderMoveEvent
  | CompleteMoveCommandersPhaseEvent
  | CompleteMovementCommandEvent
  | CompletePlayCardsPhaseEvent
  | CompleteMeleeResolutionEvent
  | CompleteRangedAttackCommandEvent
  | CompleteRangedAttackEvent
  | CompleteResolveMeleePhaseEvent
  | CardsLeavePlayEvent
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
  skipLostCommanderMoveEventSchema,
  completeMoveCommandersPhaseEventSchema,
  completeMovementCommandEventSchema,
  completePlayCardsPhaseEventSchema,
  completeMeleeResolutionEventSchema,
  completeRangedAttackCommandEventSchema,
  completeRangedAttackEventSchema,
  completeResolveMeleePhaseEventSchema,
  cardsLeavePlayEventSchema,
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
