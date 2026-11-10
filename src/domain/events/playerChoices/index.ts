// Place units during setup.
export type { SetupUnitsEvent } from './setupUnit';
export { setupUnitsEventSchema } from './setupUnit';

// Choose the command card for the round.
export type { ChooseCardEvent } from './chooseCard';
export { chooseCardEventSchema } from './chooseCard';

// Move a commander.
export type { MoveCommanderEvent } from './moveCommander';
export { moveCommanderEventSchema } from './moveCommander';

// Issue one command from the active card.
export type { IssueCommandEvent } from './issueCommand';
export { issueCommandEventSchema } from './issueCommand';

// Stop issuing commands with slots left unused.
export type { DoneIssuingCommandsEvent } from './doneIssuingCommands';
export { doneIssuingCommandsEventSchema } from './doneIssuingCommands';

// Move a unit.
export type { ChooseMovingUnitEvent } from './chooseMovingUnit';
export {
  CHOOSE_MOVING_UNIT_CHOICE_TYPE,
  chooseMovingUnitEventSchema,
} from './chooseMovingUnit';
export type { MoveUnitEvent } from './moveUnit';
export { moveUnitEventSchema } from './moveUnit';

// Take one shot of a Shoot order: name the shooter, then the target.
export type { ChooseShooterEvent } from './chooseShooter';
export {
  CHOOSE_SHOOTER_CHOICE_TYPE,
  chooseShooterEventSchema,
} from './chooseShooter';
export type { PerformRangedAttackEvent } from './performRangedAttack';
export { performRangedAttackEventSchema } from './performRangedAttack';

// Commit a card to a movement command.
export type { CommitToMovementEvent } from './commitToMovement';
export { commitToMovementEventSchema } from './commitToMovement';

// Commit a card to a ranged attack.
export type { CommitToRangedAttackEvent } from './commitToRangedAttack';
export {
  commitToRangedAttackEventSchema,
  rangedAttackModifierTypes,
} from './commitToRangedAttack';

// The target of a shot commits a card for Defence or Flexibility.
export type { CommitToRangedDefenseEvent } from './commitToRangedDefense';
export {
  commitToRangedDefenseEventSchema,
  rangedDefenseModifierTypes,
} from './commitToRangedDefense';

// Commit a card to a melee defense or attack.
export type { CommitToMeleeEvent } from './commitToMelee';
export { commitToMeleeEventSchema } from './commitToMelee';

// Pick which melee engagement to resolve.
export type { ChooseMeleeResolutionEvent } from './chooseMeleeResolution';
export { chooseMeleeResolutionEventSchema } from './chooseMeleeResolution';

// Choose whether to attempt the retreat.
export type { ChooseWhetherToRetreatEvent } from './chooseWhetherToRetreat';
export { chooseWhetherToRetreatEventSchema } from './chooseWhetherToRetreat';

// Choose which legal retreat square to take.
export type { ChooseRetreatOptionEvent } from './chooseRetreatOption';
export { chooseRetreatOptionEventSchema } from './chooseRetreatOption';

// Discard cards to pay a rout penalty.
export type { ChooseRoutDiscardEvent } from './chooseRoutDiscard';
export { chooseRoutDiscardEventSchema } from './chooseRoutDiscard';

// Choose whether to rally during cleanup.
export type { ChooseRallyEvent } from './chooseRally';
export { chooseRallyEventSchema } from './chooseRally';

// After rally, assign summed hand support to board units.
export type {
  AssignUnitSupportEvent,
  UnitSupportAssignment,
} from './assignUnitSupport';
export {
  ASSIGN_UNIT_SUPPORT_CHOICE_TYPE,
  assignUnitSupportEventSchema,
} from './assignUnitSupport';

// Any player choice, and the choice-type catalog.
export type { PlayerChoiceEvent } from './playerChoice';
export { playerChoiceEventSchema } from './playerChoice';

// Choice-type literal union.
export type { PlayerChoiceType } from './playerChoiceTypes';
export { playerChoices, playerChoiceTypeSchema } from './playerChoiceTypes';

// Projected choose-card, where the opponent's card is hidden. Commits stay public.
export type {
  ProjectedChooseCardEvent,
  ProjectedPlayerChoiceEvent,
} from './projectedPlayerChoice';
export {
  projectedChooseCardEventSchema,
  projectedPlayerChoiceEventSchema,
} from './projectedPlayerChoice';

// The modifier kinds each commitment may apply.
export type { MeleeModifier } from './commitToMelee';
export type { MovementModifier } from './commitToMovement';
export type { RangedAttackModifier } from './commitToRangedAttack';
export type { RangedDefenseModifier } from './commitToRangedDefense';
