/**
 * Re-exports every game-effect module for `@events` consumers.
 *
 * **Layout** matches [`applyEffects/`](../../transforms/stateTransitions/applyEffects/README.md)
 * and [`procedures/`](../../procedures/README.md): `cards/`, `completePhase/`, `defenseResult/`,
 * `movement/`, `resolveAttack/`, plus root [`gameEffect.ts`](./gameEffect.ts) (discriminated union).
 *
 * **Design notes** (trust model, procedure-filled fields, `AssertExact` + Zod): see applyEffects
 * README and the file-level comment on `gameEffect.ts`.
 */
export {
  DISCARD_PLAYED_CARDS_EFFECT_TYPE,
  discardPlayedCardsEventSchema,
  RESOLVE_INITIATIVE_EFFECT_TYPE,
  RESOLVE_RALLY_EFFECT_TYPE,
  RESOLVE_UNITS_BROKEN_EFFECT_TYPE,
  resolveInitiativeEventSchema,
  resolveRallyEventSchema,
  resolveUnitsBrokenEventSchema,
  REVEAL_CARDS_EFFECT_TYPE,
  revealCardsEventSchema,
} from './cards';
export type {
  DiscardPlayedCardsEvent,
  ResolveInitiativeEvent,
  ResolveRallyEvent,
  ResolveUnitsBrokenEvent,
  RevealCardsEvent,
} from './cards';
export {
  COMPLETE_CLEANUP_PHASE_EFFECT_TYPE,
  COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE,
  COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE,
  COMPLETE_PLAY_CARDS_PHASE_EFFECT_TYPE,
  COMPLETE_RESOLVE_MELEE_PHASE_EFFECT_TYPE,
  completeCleanupPhaseEventSchema,
  completeIssueCommandsPhaseEventSchema,
  completeMoveCommandersPhaseEventSchema,
  completePlayCardsPhaseEventSchema,
  completeResolveMeleePhaseEventSchema,
} from './completePhase';
export type {
  CompleteCleanupPhaseEvent,
  CompleteIssueCommandsPhaseEvent,
  CompleteMoveCommandersPhaseEvent,
  CompletePlayCardsPhaseEvent,
  CompleteResolveMeleePhaseEvent,
} from './completePhase';
export {
  ATTACK_RESOLUTION_CONTEXT_VALUES,
  attackResolutionContextSchema,
  MELEE_ATTACK_RESOLUTION_CONTEXT,
  RALLY_ROUT_RESOLUTION_SOURCE,
  RANGED_ATTACK_RESOLUTION_CONTEXT,
  REAR_ENGAGEMENT_MOVEMENT_ROUT_SOURCE,
  RESOLVE_RETREAT_EFFECT_TYPE,
  RESOLVE_REVERSE_EFFECT_TYPE,
  RESOLVE_ROUT_EFFECT_TYPE,
  resolveRetreatEventSchema,
  resolveReverseEventSchema,
  resolveRoutEventSchema,
  ROUT_RESOLUTION_SOURCE_NON_ATTACK_VALUES,
  ROUT_RESOLUTION_SOURCE_VALUES,
  routResolutionSourceSchema,
  TRIGGER_ROUT_FROM_RETREAT_EFFECT_TYPE,
  triggerRoutFromRetreatEventSchema,
  triggerRoutFromRetreatMeleeSchema,
  triggerRoutFromRetreatRangedAttackSchema,
  triggerRoutFromRetreatSharedFieldsSchema,
} from './defenseResult';
export type {
  AttackResolutionContext,
  ResolveRetreatEvent,
  ResolveReverseEvent,
  ResolveRoutEvent,
  RoutResolutionSource,
  RoutResolutionSourceNonAttack,
  TriggerRoutFromRetreatEvent,
} from './defenseResult';
export { gameEffectEventSchema, gameEffectTypeSchema } from './gameEffect';
export type { GameEffectEvent } from './gameEffect';
export { gameEffects, type GameEffectType } from './gameEffect';
export {
  COMPLETE_UNIT_MOVEMENT_EFFECT_TYPE,
  completeUnitMovementEventSchema,
  RESOLVE_ENGAGE_RETREAT_OPTION_EFFECT_TYPE,
  RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE,
  resolveEngageRetreatOptionEventSchema,
  resolveFlankEngagementEventSchema,
  START_ENGAGEMENT_EFFECT_TYPE,
  startEngagementEventSchema,
} from './movement';
export type {
  CompleteUnitMovementEvent,
  ResolveEngageRetreatOptionEvent,
  ResolveFlankEngagementEvent,
  StartEngagementEvent,
} from './movement';
export {
  COMPLETE_ATTACK_APPLY_EFFECT_TYPE,
  COMPLETE_MELEE_RESOLUTION_EFFECT_TYPE,
  COMPLETE_RANGED_ATTACK_COMMAND_EFFECT_TYPE,
  completeAttackApplyEventSchema,
  completeMeleeResolutionEventSchema,
  completeRangedAttackCommandEventSchema,
  RESOLVE_MELEE_EFFECT_TYPE,
  RESOLVE_RANGED_ATTACK_EFFECT_TYPE,
  resolveMeleeEventSchema,
  resolveRangedAttackEventSchema,
} from './resolveAttack';
export type {
  CompleteAttackApplyEvent,
  CompleteMeleeResolutionEvent,
  CompleteRangedAttackCommandEvent,
  ResolveMeleeEvent,
  ResolveRangedAttackEvent,
} from './resolveAttack';
