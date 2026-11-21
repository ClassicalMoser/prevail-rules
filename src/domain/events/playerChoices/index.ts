// Every decision the rules leave to a player, in the order a round asks for
// them: setup, the card, the commanders, the orders, a move and the choices a
// front engagement brings, a shot, a melee, a rout's price, and the rally.

// Their literal discriminants.
export { SETUP_UNITS_CHOICE_TYPE } from './setupUnits';
export { CHOOSE_CARD_CHOICE_TYPE } from './chooseCard';
export { MOVE_COMMANDER_CHOICE_TYPE } from './moveCommander';
export { ISSUE_COMMANDS_CHOICE_TYPE } from './issueCommands';
export { CHOOSE_MOVING_UNIT_CHOICE_TYPE } from './chooseMovingUnit';
export { COMMIT_TO_MOVEMENT_CHOICE_TYPE } from './commitToMovement';
export { MOVE_UNIT_CHOICE_TYPE } from './moveUnit';
export { CHOOSE_WHETHER_TO_RETREAT_CHOICE_TYPE } from './chooseWhetherToRetreat';
export { CHOOSE_RETREAT_OPTION_CHOICE_TYPE } from './chooseRetreatOption';
export { CHOOSE_SHOOTER_CHOICE_TYPE } from './chooseShooter';
export { COMMIT_TO_RANGED_ATTACK_CHOICE_TYPE } from './commitToRangedAttack';
export { PERFORM_RANGED_ATTACK_CHOICE_TYPE } from './performRangedAttack';
export { COMMIT_TO_RANGED_DEFENSE_CHOICE_TYPE } from './commitToRangedDefense';
export { CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE } from './chooseMeleeResolution';
export { COMMIT_TO_MELEE_CHOICE_TYPE } from './commitToMelee';
export { CHOOSE_ROUT_DISCARD_CHOICE_TYPE } from './chooseRoutDiscard';
export { CHOOSE_RALLY_CHOICE_TYPE } from './chooseRally';
export { ASSIGN_UNIT_SUPPORT_CHOICE_TYPE } from './assignUnitSupport';

// Their schemas.
export { setupUnitsEventSchema } from './setupUnits';
export { chooseCardEventSchema } from './chooseCard';
export { moveCommanderEventSchema } from './moveCommander';
export { issueCommandsEventSchema } from './issueCommands';
export { chooseMovingUnitEventSchema } from './chooseMovingUnit';
export { commitToMovementEventSchema } from './commitToMovement';
export { moveUnitEventSchema } from './moveUnit';
export { chooseWhetherToRetreatEventSchema } from './chooseWhetherToRetreat';
export { chooseRetreatOptionEventSchema } from './chooseRetreatOption';
export { chooseShooterEventSchema } from './chooseShooter';
export { commitToRangedAttackEventSchema } from './commitToRangedAttack';
export { performRangedAttackEventSchema } from './performRangedAttack';
export { commitToRangedDefenseEventSchema } from './commitToRangedDefense';
export { chooseMeleeResolutionEventSchema } from './chooseMeleeResolution';
export { commitToMeleeEventSchema } from './commitToMelee';
export { chooseRoutDiscardEventSchema } from './chooseRoutDiscard';
export { chooseRallyEventSchema } from './chooseRally';
export { assignUnitSupportEventSchema } from './assignUnitSupport';

// Their types. A unit-support assignment is one entry of the last.
export type { SetupUnitsEvent } from './setupUnits';
export type { ChooseCardEvent } from './chooseCard';
export type { MoveCommanderEvent } from './moveCommander';
export type { IssueCommandsEvent } from './issueCommands';
export type { ChooseMovingUnitEvent } from './chooseMovingUnit';
export type { CommitToMovementEvent } from './commitToMovement';
export type { MoveUnitEvent } from './moveUnit';
export type { ChooseWhetherToRetreatEvent } from './chooseWhetherToRetreat';
export type { ChooseRetreatOptionEvent } from './chooseRetreatOption';
export type { ChooseShooterEvent } from './chooseShooter';
export type { CommitToRangedAttackEvent } from './commitToRangedAttack';
export type { PerformRangedAttackEvent } from './performRangedAttack';
export type { CommitToRangedDefenseEvent } from './commitToRangedDefense';
export type { ChooseMeleeResolutionEvent } from './chooseMeleeResolution';
export type { CommitToMeleeEvent } from './commitToMelee';
export type { ChooseRoutDiscardEvent } from './chooseRoutDiscard';
export type { ChooseRallyEvent } from './chooseRally';
export type {
  AssignUnitSupportEvent,
  UnitSupportAssignment,
} from './assignUnitSupport';

// The four moments a card may be committed, and a commitment at any of them.
export { commitmentChoiceTypes } from './commitmentChoices';
export type {
  CommitmentChoiceType,
  CommitmentEvent,
} from './commitmentChoices';

// Any player choice: the union, its schema, and the choice-type names from
// ruleValues with their schema.
export {
  playerChoiceEventSchema,
  playerChoices,
  playerChoiceTypeSchema,
} from './playerChoice';
export type { PlayerChoiceEvent, PlayerChoiceType } from './playerChoice';

// A choice as the other seat sees it: the opponent's chosen card hidden;
// commitments stay public.
export {
  projectedChooseCardEventSchema,
  projectedPlayerChoiceEventSchema,
} from './projectedPlayerChoice';
export type {
  ProjectedChooseCardEvent,
  ProjectedPlayerChoiceEvent,
} from './projectedPlayerChoice';
