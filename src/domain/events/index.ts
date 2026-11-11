// Event kinds: a game effect or a player choice.
export {
  eventSchema,
  projectedEventSchema,
  eventTypes,
  eventTypeSchema,
  GAME_EFFECT_EVENT_TYPE,
  PLAYER_CHOICE_EVENT_TYPE,
} from './eventType';
export type { Event, EventType, ProjectedEvent } from './eventType';

// What the engine expects next: an effect, a choice, or the union of both.
export type { ExpectedEventInfo } from './expectedEvent';
export type { ExpectedPlayerInput, PlayerSource } from './expectedEvent';
export type { ExpectedGameEffect } from './expectedEvent';

// Game-effect payloads, grouped by the folder they live in.
export {
  ATTACK_RESOLUTION_CONTEXT_VALUES,
  attackResolutionContextSchema,
  COMPLETE_ATTACK_APPLY_EFFECT_TYPE,
  ROUND_END_EFFECT_TYPE,
  COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE,
  COMPLETE_MELEE_RESOLUTION_EFFECT_TYPE,
  COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE,
  COMPLETE_MOVEMENT_COMMAND_EFFECT_TYPE,
  COMPLETE_PLAY_CARDS_PHASE_EFFECT_TYPE,
  COMPLETE_RANGED_ATTACK_COMMAND_EFFECT_TYPE,
  COMPLETE_RANGED_ATTACK_EFFECT_TYPE,
  COMPLETE_RESOLVE_MELEE_PHASE_EFFECT_TYPE,
  COMPLETE_UNIT_MOVEMENT_EFFECT_TYPE,
  completeAttackApplyEventSchema,
  roundEndEventSchema,
  completeIssueCommandsPhaseEventSchema,
  completeMeleeResolutionEventSchema,
  completeMoveCommandersPhaseEventSchema,
  completeMovementCommandEventSchema,
  completePlayCardsPhaseEventSchema,
  completeRangedAttackCommandEventSchema,
  completeRangedAttackEventSchema,
  completeResolveMeleePhaseEventSchema,
  completeUnitMovementEventSchema,
  DISCARD_PLAYED_CARDS_EFFECT_TYPE,
  discardPlayedCardsEventSchema,
  GAME_OVER_EFFECT_TYPE,
  gameOverEventSchema,
  gameEffectEventSchema,
  gameEffects,
  gameEffectTypeSchema,
  MELEE_ATTACK_RESOLUTION_CONTEXT,
  OPEN_RETREAT_FROM_ATTACK_APPLY_EFFECT_TYPE,
  OPEN_REVERSE_FROM_ATTACK_APPLY_EFFECT_TYPE,
  OPEN_ROUT_FROM_ATTACK_APPLY_EFFECT_TYPE,
  openRetreatFromAttackApplyEventSchema,
  openReverseFromAttackApplyEventSchema,
  openRoutFromAttackApplyEventSchema,
  RANGED_ATTACK_RESOLUTION_CONTEXT,
  OPEN_RETREAT_FROM_ENGAGEMENT_EFFECT_TYPE,
  RESOLVE_ENGAGE_RETREAT_OPTION_EFFECT_TYPE,
  RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE,
  RESOLVE_INITIATIVE_EFFECT_TYPE,
  RESOLVE_MELEE_EFFECT_TYPE,
  RESOLVE_RALLY_EFFECT_TYPE,
  RESOLVE_RANGED_ATTACK_EFFECT_TYPE,
  RESOLVE_RETREAT_EFFECT_TYPE,
  RESOLVE_REVERSE_EFFECT_TYPE,
  RESOLVE_ROUT_EFFECT_TYPE,
  openRetreatFromEngagementEventSchema,
  resolveEngageRetreatOptionEventSchema,
  resolveFlankEngagementEventSchema,
  resolveInitiativeEventSchema,
  resolveMeleeEventSchema,
  resolveRallyEventSchema,
  resolveRangedAttackEventSchema,
  resolveRetreatEventSchema,
  resolveReverseEventSchema,
  resolveRoutEventSchema,
  REVEAL_CARDS_EFFECT_TYPE,
  revealCardsEventSchema,
  START_ENGAGEMENT_EFFECT_TYPE,
  startEngagementEventSchema,
  TRIGGER_ROUT_FROM_RETREAT_EFFECT_TYPE,
  triggerRoutFromRetreatEventSchema,
} from './gameEffects';
export type {
  AttackResolutionContext,
  CompleteAttackApplyEvent,
  RoundEndEvent,
  CompleteIssueCommandsPhaseEvent,
  CompleteMeleeResolutionEvent,
  CompleteMoveCommandersPhaseEvent,
  CompleteMovementCommandEvent,
  CompletePlayCardsPhaseEvent,
  CompleteRangedAttackCommandEvent,
  CompleteRangedAttackEvent,
  CompleteResolveMeleePhaseEvent,
  CompleteUnitMovementEvent,
  DiscardPlayedCardsEvent,
  GameEffectEvent,
  GameEffectType,
  GameOverEvent,
  OpenRetreatFromAttackApplyEvent,
  OpenReverseFromAttackApplyEvent,
  OpenRoutFromAttackApplyEvent,
  OpenRetreatFromEngagementEvent,
  ResolveEngageRetreatOptionEvent,
  ResolveFlankEngagementEvent,
  ResolveInitiativeEvent,
  ResolveMeleeEvent,
  ResolveRallyEvent,
  ResolveRangedAttackEvent,
  ResolveRetreatEvent,
  ResolveReverseEvent,
  ResolveRoutEvent,
  RevealCardsEvent,
  StartEngagementEvent,
  TriggerRoutFromRetreatEvent,
} from './gameEffects';

// Player choices, in round order, then the choice union and projections.
export type { SetupUnitsEvent } from './playerChoices';
export { setupUnitsEventSchema } from './playerChoices';
export type { ChooseCardEvent } from './playerChoices';
export { chooseCardEventSchema } from './playerChoices';
export type { MoveCommanderEvent } from './playerChoices';
export { moveCommanderEventSchema } from './playerChoices';
export type {
  IssueCommandEvent,
  LineOrderSelection,
  OrderSelection,
  UnitsOrderSelection,
} from './playerChoices';
export { issueCommandEventSchema } from './playerChoices';
export type { DoneIssuingCommandsEvent } from './playerChoices';
export { doneIssuingCommandsEventSchema } from './playerChoices';
export type { ChooseMovingUnitEvent } from './playerChoices';
export {
  CHOOSE_MOVING_UNIT_CHOICE_TYPE,
  chooseMovingUnitEventSchema,
} from './playerChoices';
export type { MoveUnitEvent } from './playerChoices';
export { moveUnitEventSchema } from './playerChoices';
export type { ChooseShooterEvent } from './playerChoices';
export {
  CHOOSE_SHOOTER_CHOICE_TYPE,
  chooseShooterEventSchema,
} from './playerChoices';
export type { PerformRangedAttackEvent } from './playerChoices';
export { performRangedAttackEventSchema } from './playerChoices';
export type { CommitToMovementEvent } from './playerChoices';
export { commitToMovementEventSchema } from './playerChoices';
export type { CommitToRangedAttackEvent } from './playerChoices';
export { commitToRangedAttackEventSchema } from './playerChoices';
export type { CommitToRangedDefenseEvent } from './playerChoices';
export { commitToRangedDefenseEventSchema } from './playerChoices';
export type { CommitToMeleeEvent } from './playerChoices';
export { commitToMeleeEventSchema } from './playerChoices';
export type { ChooseMeleeResolutionEvent } from './playerChoices';
export { chooseMeleeResolutionEventSchema } from './playerChoices';
export type { ChooseWhetherToRetreatEvent } from './playerChoices';
export { chooseWhetherToRetreatEventSchema } from './playerChoices';
export type { ChooseRetreatOptionEvent } from './playerChoices';
export { chooseRetreatOptionEventSchema } from './playerChoices';
export type { ChooseRoutDiscardEvent } from './playerChoices';
export { chooseRoutDiscardEventSchema } from './playerChoices';
export type { ChooseRallyEvent } from './playerChoices';
export { chooseRallyEventSchema } from './playerChoices';
export type {
  AssignUnitSupportEvent,
  UnitSupportAssignment,
} from './playerChoices';
export {
  ASSIGN_UNIT_SUPPORT_CHOICE_TYPE,
  assignUnitSupportEventSchema,
} from './playerChoices';
export type {
  PlayerChoiceEvent,
  PlayerChoiceType,
  ProjectedChooseCardEvent,
  ProjectedPlayerChoiceEvent,
} from './playerChoices';
export {
  playerChoiceEventSchema,
  playerChoiceTypeSchema,
  projectedChooseCardEventSchema,
  projectedPlayerChoiceEventSchema,
} from './playerChoices';
