/**
 * Re-exports every game-effect module for `@events` consumers.
 *
 * **Layout** matches [`applyEffects/`](../../transforms/stateTransitions/applyEffects/README.md)
 * and [`procedures/`](../../procedures/README.md): `cards/`, `completePhase/`, `defenseResult/`,
 * `movement/`, `resolveAttack/`, plus root [`gameEffect.ts`](./gameEffect.ts) (discriminated union).
 *
 * **Design notes** (trust model, procedure-filled fields, `AssertExact` + Zod): see applyEffects
 * README and the file-level comment on `gameEffect.ts`.
 *
 * TODO(misleading): "see applyEffects README" is a pointer to another document, which STYLE.md rules out.
 */

// Cards: discarding the played cards, the reveal, initiative, a rally, and the end of the game.
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
// The end of each phase, of a player's issuing, of a fallen commander's passed turn, and of the round.
export {
  ROUND_END_EFFECT_TYPE,
  COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE,
  COMPLETE_ISSUING_COMMANDS_EFFECT_TYPE,
  SKIP_LOST_COMMANDER_MOVE_EFFECT_TYPE,
  COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE,
  COMPLETE_PLAY_CARDS_PHASE_EFFECT_TYPE,
  COMPLETE_RESOLVE_MELEE_PHASE_EFFECT_TYPE,
  roundEndEventSchema,
  completeIssueCommandsPhaseEventSchema,
  completeIssuingCommandsEventSchema,
  skipLostCommanderMoveEventSchema,
  completeMoveCommandersPhaseEventSchema,
  completePlayCardsPhaseEventSchema,
  completeResolveMeleePhaseEventSchema,
} from './completePhase';
export type {
  RoundEndEvent,
  CompleteIssueCommandsPhaseEvent,
  CompleteIssuingCommandsEvent,
  SkipLostCommanderMoveEvent,
  CompleteMoveCommandersPhaseEvent,
  CompletePlayCardsPhaseEvent,
  CompleteResolveMeleePhaseEvent,
} from './completePhase';
// Retreat, reverse and rout, triggering a rout from a retreat, and opening each on an attack's apply.
export {
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
} from './defenseResult';
export type {
  OpenRetreatFromAttackApplyEvent,
  OpenReverseFromAttackApplyEvent,
  OpenRoutFromAttackApplyEvent,
  ResolveRetreatEvent,
  ResolveReverseEvent,
  ResolveRoutEvent,
  TriggerRoutFromRetreatEvent,
} from './defenseResult';
// Any game effect: the union, its schema, and the list of effect types.
export { gameEffectEventSchema, gameEffectTypeSchema } from './gameEffect';
export type { GameEffectEvent, GameEffectEventOfType } from './gameEffect';
export { gameEffects, type GameEffectType } from './gameEffect';
// The end of a unit's move and of a Move order; an engagement started, the flank turn, and a front-engaged defender's retreat.
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
// A melee and a shot measured; the end of an attack's results, of a melee, of a shot, and of a Shoot order.
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
