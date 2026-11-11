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
  GAME_OVER_EFFECT_TYPE,
  gameOverEventSchema,
  RESOLVE_INITIATIVE_EFFECT_TYPE,
  RESOLVE_RALLY_EFFECT_TYPE,
  resolveInitiativeEventSchema,
  resolveRallyEventSchema,
  REVEAL_CARDS_EFFECT_TYPE,
  revealCardsEventSchema,
} from './cards';
export type {
  DiscardPlayedCardsEvent,
  GameOverEvent,
  ResolveInitiativeEvent,
  ResolveRallyEvent,
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
  RANGED_ATTACK_RESOLUTION_CONTEXT,
  OPEN_RETREAT_FROM_ATTACK_APPLY_EFFECT_TYPE,
  OPEN_REVERSE_FROM_ATTACK_APPLY_EFFECT_TYPE,
  OPEN_ROUT_FROM_ATTACK_APPLY_EFFECT_TYPE,
  openRetreatFromAttackApplyEventSchema,
  openReverseFromAttackApplyEventSchema,
  openRoutFromAttackApplyEventSchema,
  RESOLVE_RETREAT_EFFECT_TYPE,
  RESOLVE_REVERSE_EFFECT_TYPE,
  RESOLVE_ROUT_EFFECT_TYPE,
  resolveRetreatEventSchema,
  resolveReverseEventSchema,
  resolveRoutEventSchema,
  TRIGGER_ROUT_FROM_RETREAT_EFFECT_TYPE,
  triggerRoutFromRetreatEventSchema,
  triggerRoutFromRetreatMeleeSchema,
  triggerRoutFromRetreatRangedAttackSchema,
  triggerRoutFromRetreatSharedFieldsSchema,
} from './defenseResult';
export type {
  AttackResolutionContext,
  OpenRetreatFromAttackApplyEvent,
  OpenReverseFromAttackApplyEvent,
  OpenRoutFromAttackApplyEvent,
  ResolveRetreatEvent,
  ResolveReverseEvent,
  ResolveRoutEvent,
  TriggerRoutFromRetreatEvent,
} from './defenseResult';
export { gameEffectEventSchema, gameEffectTypeSchema } from './gameEffect';
export type { GameEffectEvent, GameEffectEventOfType } from './gameEffect';
export { gameEffects, type GameEffectType } from './gameEffect';
export {
  COMPLETE_MOVEMENT_COMMAND_EFFECT_TYPE,
  COMPLETE_UNIT_MOVEMENT_EFFECT_TYPE,
  completeMovementCommandEventSchema,
  completeUnitMovementEventSchema,
  OPEN_RETREAT_FROM_ENGAGEMENT_EFFECT_TYPE,
  RESOLVE_ENGAGE_RETREAT_OPTION_EFFECT_TYPE,
  RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE,
  openRetreatFromEngagementEventSchema,
  resolveEngageRetreatOptionEventSchema,
  resolveFlankEngagementEventSchema,
  START_ENGAGEMENT_EFFECT_TYPE,
  startEngagementEventSchema,
} from './movement';
export type {
  CompleteMovementCommandEvent,
  CompleteUnitMovementEvent,
  OpenRetreatFromEngagementEvent,
  ResolveEngageRetreatOptionEvent,
  ResolveFlankEngagementEvent,
  StartEngagementEvent,
} from './movement';
export {
  COMPLETE_ATTACK_APPLY_EFFECT_TYPE,
  COMPLETE_MELEE_RESOLUTION_EFFECT_TYPE,
  COMPLETE_RANGED_ATTACK_COMMAND_EFFECT_TYPE,
  COMPLETE_RANGED_ATTACK_EFFECT_TYPE,
  completeAttackApplyEventSchema,
  completeMeleeResolutionEventSchema,
  completeRangedAttackCommandEventSchema,
  completeRangedAttackEventSchema,
  RESOLVE_MELEE_EFFECT_TYPE,
  RESOLVE_RANGED_ATTACK_EFFECT_TYPE,
  resolveMeleeEventSchema,
  resolveRangedAttackEventSchema,
} from './resolveAttack';
export type {
  CompleteAttackApplyEvent,
  CompleteMeleeResolutionEvent,
  CompleteRangedAttackCommandEvent,
  CompleteRangedAttackEvent,
  ResolveMeleeEvent,
  ResolveRangedAttackEvent,
} from './resolveAttack';
