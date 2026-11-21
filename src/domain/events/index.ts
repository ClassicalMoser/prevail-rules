// Event kinds: a game effect or a player choice. Their literals, their list
// and its schema; then any event, and any event as a seat sees it.
export {
  GAME_EFFECT_EVENT_TYPE,
  PLAYER_CHOICE_EVENT_TYPE,
  eventTypes,
  eventTypeSchema,
  eventSchema,
  projectedEventSchema,
} from './eventType';
export type { EventType, Event, ProjectedEvent } from './eventType';

// What the engine expects next: an effect, a choice, or either.
export type {
  ExpectedGameEffect,
  ExpectedPlayerInput,
  PlayerSource,
  ExpectedEventInfo,
} from './expectedEvent';

// Game effects (gameEffects/), folder by folder, each in the order a round
// meets them: their literal discriminants, then their schemas, then their
// types.

// Cards: the reveal and the initiative it settles, discarding the played cards,
// a rally, and the end of the game.
export {
  REVEAL_CARDS_EFFECT_TYPE,
  RESOLVE_INITIATIVE_EFFECT_TYPE,
  DISCARD_PLAYED_CARDS_EFFECT_TYPE,
  RESOLVE_RALLY_EFFECT_TYPE,
  GAME_OVER_EFFECT_TYPE,
} from './gameEffects';
export {
  revealCardsEventSchema,
  resolveInitiativeEventSchema,
  discardPlayedCardsEventSchema,
  resolveRallyEventSchema,
  gameOverEventSchema,
} from './gameEffects';
export type {
  RevealCardsEvent,
  ResolveInitiativeEvent,
  DiscardPlayedCardsEvent,
  ResolveRallyEvent,
  GameOverEvent,
} from './gameEffects';

// Sequencing: the end of each phase in turn, a fallen commander's turn passed
// over, and the end of the round.
export {
  COMPLETE_PLAY_CARDS_PHASE_EFFECT_TYPE,
  SKIP_LOST_COMMANDER_MOVE_EFFECT_TYPE,
  COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE,
  COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE,
  COMPLETE_RESOLVE_MELEE_PHASE_EFFECT_TYPE,
  ROUND_END_EFFECT_TYPE,
} from './gameEffects';
export {
  completePlayCardsPhaseEventSchema,
  skipLostCommanderMoveEventSchema,
  completeMoveCommandersPhaseEventSchema,
  completeIssueCommandsPhaseEventSchema,
  completeResolveMeleePhaseEventSchema,
  roundEndEventSchema,
} from './gameEffects';
export type {
  CompletePlayCardsPhaseEvent,
  SkipLostCommanderMoveEvent,
  CompleteMoveCommandersPhaseEvent,
  CompleteIssueCommandsPhaseEvent,
  CompleteResolveMeleePhaseEvent,
  RoundEndEvent,
} from './gameEffects';

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
} from './gameEffects';
export {
  startEngagementEventSchema,
  resolveEngageRetreatOptionEventSchema,
  openRetreatFromEngagementEventSchema,
  resolveFlankEngagementEventSchema,
  completeUnitMovementEventSchema,
  completeMovementCommandEventSchema,
} from './gameEffects';
export type {
  StartEngagementEvent,
  ResolveEngageRetreatOptionEvent,
  OpenRetreatFromEngagementEvent,
  ResolveFlankEngagementEvent,
  CompleteUnitMovementEvent,
  CompleteMovementCommandEvent,
} from './gameEffects';

// Attacks: a shot and a melee measured; the end of an attack's results, of a
// shot, of a Shoot order, and of a melee.
export {
  RESOLVE_RANGED_ATTACK_EFFECT_TYPE,
  RESOLVE_MELEE_EFFECT_TYPE,
  COMPLETE_ATTACK_APPLY_EFFECT_TYPE,
  COMPLETE_RANGED_ATTACK_EFFECT_TYPE,
  COMPLETE_RANGED_ATTACK_COMMAND_EFFECT_TYPE,
  COMPLETE_MELEE_RESOLUTION_EFFECT_TYPE,
} from './gameEffects';
export {
  resolveRangedAttackEventSchema,
  resolveMeleeEventSchema,
  completeAttackApplyEventSchema,
  completeRangedAttackEventSchema,
  completeRangedAttackCommandEventSchema,
  completeMeleeResolutionEventSchema,
} from './gameEffects';
export type {
  ResolveRangedAttackEvent,
  ResolveMeleeEvent,
  CompleteAttackApplyEvent,
  CompleteRangedAttackEvent,
  CompleteRangedAttackCommandEvent,
  CompleteMeleeResolutionEvent,
} from './gameEffects';

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
} from './gameEffects';
export {
  openRetreatFromAttackApplyEventSchema,
  resolveRetreatEventSchema,
  triggerRoutFromRetreatEventSchema,
  openReverseFromAttackApplyEventSchema,
  resolveReverseEventSchema,
  openRoutFromAttackApplyEventSchema,
  resolveRoutEventSchema,
} from './gameEffects';
export type {
  OpenRetreatFromAttackApplyEvent,
  ResolveRetreatEvent,
  TriggerRoutFromRetreatEvent,
  OpenReverseFromAttackApplyEvent,
  ResolveReverseEvent,
  OpenRoutFromAttackApplyEvent,
  ResolveRoutEvent,
} from './gameEffects';

// Any game effect: the union, its schema, and the effect-type names with
// their schema.
export {
  gameEffectEventSchema,
  gameEffects,
  gameEffectTypeSchema,
} from './gameEffects';
export type { GameEffectEvent, GameEffectType } from './gameEffects';

// Player choices (playerChoices/), in the order a round asks for them: setup,
// the card, the commanders, the orders, a move and the choices a front
// engagement brings, a shot, a melee, a rout's price, and the rally.
export {
  SETUP_UNITS_CHOICE_TYPE,
  CHOOSE_CARD_CHOICE_TYPE,
  MOVE_COMMANDER_CHOICE_TYPE,
  ISSUE_COMMANDS_CHOICE_TYPE,
  CHOOSE_MOVING_UNIT_CHOICE_TYPE,
  COMMIT_TO_MOVEMENT_CHOICE_TYPE,
  MOVE_UNIT_CHOICE_TYPE,
  CHOOSE_WHETHER_TO_RETREAT_CHOICE_TYPE,
  CHOOSE_RETREAT_OPTION_CHOICE_TYPE,
  CHOOSE_SHOOTER_CHOICE_TYPE,
  COMMIT_TO_RANGED_ATTACK_CHOICE_TYPE,
  PERFORM_RANGED_ATTACK_CHOICE_TYPE,
  COMMIT_TO_RANGED_DEFENSE_CHOICE_TYPE,
  CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE,
  COMMIT_TO_MELEE_CHOICE_TYPE,
  CHOOSE_ROUT_DISCARD_CHOICE_TYPE,
  CHOOSE_RALLY_CHOICE_TYPE,
  ASSIGN_UNIT_SUPPORT_CHOICE_TYPE,
} from './playerChoices';
export {
  setupUnitsEventSchema,
  chooseCardEventSchema,
  moveCommanderEventSchema,
  issueCommandsEventSchema,
  chooseMovingUnitEventSchema,
  commitToMovementEventSchema,
  moveUnitEventSchema,
  chooseWhetherToRetreatEventSchema,
  chooseRetreatOptionEventSchema,
  chooseShooterEventSchema,
  commitToRangedAttackEventSchema,
  performRangedAttackEventSchema,
  commitToRangedDefenseEventSchema,
  chooseMeleeResolutionEventSchema,
  commitToMeleeEventSchema,
  chooseRoutDiscardEventSchema,
  chooseRallyEventSchema,
  assignUnitSupportEventSchema,
} from './playerChoices';
export type {
  SetupUnitsEvent,
  ChooseCardEvent,
  MoveCommanderEvent,
  IssueCommandsEvent,
  ChooseMovingUnitEvent,
  CommitToMovementEvent,
  MoveUnitEvent,
  ChooseWhetherToRetreatEvent,
  ChooseRetreatOptionEvent,
  ChooseShooterEvent,
  CommitToRangedAttackEvent,
  PerformRangedAttackEvent,
  CommitToRangedDefenseEvent,
  ChooseMeleeResolutionEvent,
  CommitToMeleeEvent,
  ChooseRoutDiscardEvent,
  ChooseRallyEvent,
  AssignUnitSupportEvent,
  UnitSupportAssignment,
} from './playerChoices';

// The four moments a card may be committed, and a commitment at any of them.
export { commitmentChoiceTypes } from './playerChoices';
export type { CommitmentChoiceType, CommitmentEvent } from './playerChoices';

// Any player choice: the union, its schema, and the choice-type names with
// their schema.
export {
  playerChoiceEventSchema,
  playerChoices,
  playerChoiceTypeSchema,
} from './playerChoices';
export type { PlayerChoiceEvent, PlayerChoiceType } from './playerChoices';

// A choice as the other seat sees it: the opponent's chosen card hidden;
// commitments stay public.
export {
  projectedChooseCardEventSchema,
  projectedPlayerChoiceEventSchema,
} from './playerChoices';
export type {
  ProjectedChooseCardEvent,
  ProjectedPlayerChoiceEvent,
} from './playerChoices';
