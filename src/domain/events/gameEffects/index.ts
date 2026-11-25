/**
 * Re-exports every game-effect module for `@events` consumers.
 *
 * **Layout** matches [`applyEffects/`](../../transforms/stateTransitions/applyEffects/README.md)
 * and [`procedures/`](../../procedures/README.md): `cards/`, `sequencing/`, `movement/`,
 * `resolveAttack/`, `defenseResult/`, plus root [`gameEffect.ts`](./gameEffect.ts) (discriminated union).
 *
 * Each folder's effects are listed in the order a round meets them: their
 * literal discriminants, then their schemas, then their types.
 *
 * **Design notes**: why an applied effect is trusted, why it carries only
 * what a procedure decided, and how each schema is tied to its interface
 * (`AssertExact` with Zod), are in the
 * [`applyEffects` README](../../transforms/stateTransitions/applyEffects/README.md).
 */

// Cards: the reveal and the initiative it settles, the cards leaving play,
// a rally, and the end of the game.
export {
  REVEAL_CARDS_EFFECT_TYPE,
  RESOLVE_INITIATIVE_EFFECT_TYPE,
  CARDS_LEAVE_PLAY_EFFECT_TYPE,
  RESOLVE_RALLY_EFFECT_TYPE,
  GAME_OVER_EFFECT_TYPE,
} from './cards';
export {
  revealCardsEventSchema,
  resolveInitiativeEventSchema,
  cardsLeavePlayEventSchema,
  resolveRallyEventSchema,
  gameOverEventSchema,
} from './cards';
export type {
  RevealCardsEvent,
  ResolveInitiativeEvent,
  CardsLeavePlayEvent,
  ResolveRallyEvent,
  GameOverEvent,
} from './cards';

// Sequencing: the end of each phase in turn, a fallen commander's turn passed
// over, and the end of the round.
export {
  COMPLETE_PLAY_CARDS_PHASE_EFFECT_TYPE,
  SKIP_LOST_COMMANDER_MOVE_EFFECT_TYPE,
  COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE,
  COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE,
  COMPLETE_RESOLVE_MELEE_PHASE_EFFECT_TYPE,
  ROUND_END_EFFECT_TYPE,
} from './sequencing';
export {
  completePlayCardsPhaseEventSchema,
  skipLostCommanderMoveEventSchema,
  completeMoveCommandersPhaseEventSchema,
  completeIssueCommandsPhaseEventSchema,
  completeResolveMeleePhaseEventSchema,
  roundEndEventSchema,
} from './sequencing';
export type {
  CompletePlayCardsPhaseEvent,
  SkipLostCommanderMoveEvent,
  CompleteMoveCommandersPhaseEvent,
  CompleteIssueCommandsPhaseEvent,
  CompleteResolveMeleePhaseEvent,
  RoundEndEvent,
} from './sequencing';

// Movement: an engagement started; a front-engaged defender's chance to fall
// back, and its retreat; the flank turn; the end of a unit's move and of a Move
// order.
export {
  START_ENGAGEMENT_EFFECT_TYPE,
  RESOLVE_ENGAGE_RETREAT_OPTION_EFFECT_TYPE,
  OPEN_RETREAT_FROM_ENGAGEMENT_EFFECT_TYPE,
  RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE,
  COMPLETE_UNIT_MOVEMENT_EFFECT_TYPE,
  COMPLETE_MOVEMENT_COMMAND_EFFECT_TYPE,
} from './movement';
export {
  startEngagementEventSchema,
  resolveEngageRetreatOptionEventSchema,
  openRetreatFromEngagementEventSchema,
  resolveFlankEngagementEventSchema,
  completeUnitMovementEventSchema,
  completeMovementCommandEventSchema,
} from './movement';
export type {
  StartEngagementEvent,
  ResolveEngageRetreatOptionEvent,
  OpenRetreatFromEngagementEvent,
  ResolveFlankEngagementEvent,
  CompleteUnitMovementEvent,
  CompleteMovementCommandEvent,
} from './movement';

// Attacks: a shot and a melee measured; the end of an attack's results, of a
// shot, of a Shoot order, and of a melee.
export {
  RESOLVE_RANGED_ATTACK_EFFECT_TYPE,
  RESOLVE_MELEE_EFFECT_TYPE,
  COMPLETE_ATTACK_APPLY_EFFECT_TYPE,
  COMPLETE_RANGED_ATTACK_EFFECT_TYPE,
  COMPLETE_RANGED_ATTACK_COMMAND_EFFECT_TYPE,
  COMPLETE_MELEE_RESOLUTION_EFFECT_TYPE,
} from './resolveAttack';
export {
  resolveRangedAttackEventSchema,
  resolveMeleeEventSchema,
  completeAttackApplyEventSchema,
  completeRangedAttackEventSchema,
  completeRangedAttackCommandEventSchema,
  completeMeleeResolutionEventSchema,
} from './resolveAttack';
export type {
  ResolveRangedAttackEvent,
  ResolveMeleeEvent,
  CompleteAttackApplyEvent,
  CompleteRangedAttackEvent,
  CompleteRangedAttackCommandEvent,
  CompleteMeleeResolutionEvent,
} from './resolveAttack';

// Defence results: a retreat opened and resolved, or failed into a rout; a
// reverse opened and resolved; a rout opened and resolved.
export {
  OPEN_RETREAT_FROM_ATTACK_APPLY_EFFECT_TYPE,
  RESOLVE_RETREAT_EFFECT_TYPE,
  TRIGGER_ROUT_FROM_RETREAT_EFFECT_TYPE,
  OPEN_REVERSE_FROM_ATTACK_APPLY_EFFECT_TYPE,
  RESOLVE_REVERSE_EFFECT_TYPE,
  OPEN_ROUT_FROM_ATTACK_APPLY_EFFECT_TYPE,
  RESOLVE_ROUT_EFFECT_TYPE,
} from './defenseResult';
export {
  openRetreatFromAttackApplyEventSchema,
  resolveRetreatEventSchema,
  triggerRoutFromRetreatEventSchema,
  openReverseFromAttackApplyEventSchema,
  resolveReverseEventSchema,
  openRoutFromAttackApplyEventSchema,
  resolveRoutEventSchema,
} from './defenseResult';
export type {
  OpenRetreatFromAttackApplyEvent,
  ResolveRetreatEvent,
  TriggerRoutFromRetreatEvent,
  OpenReverseFromAttackApplyEvent,
  ResolveReverseEvent,
  OpenRoutFromAttackApplyEvent,
  ResolveRoutEvent,
} from './defenseResult';

// Any game effect: the union, its schema, and the list of effect types.
export { gameEffectEventSchema, gameEffectTypeSchema } from './gameEffect';
export type { GameEffectEvent } from './gameEffect';
export { gameEffects, type GameEffectType } from './gameEffect';
