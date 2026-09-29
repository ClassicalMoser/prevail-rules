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
export type { MoveUnitEvent } from './moveUnit';
export { moveUnitEventSchema } from './moveUnit';

// Declare a ranged attack.
export type { PerformRangedAttackEvent } from './performRangedAttack';
export { performRangedAttackEventSchema } from './performRangedAttack';

// Commit a card to a movement command.
export type { CommitToMovementEvent } from './commitToMovement';
export { commitToMovementEventSchema } from './commitToMovement';

// Commit a card to a ranged attack.
export type { CommitToRangedAttackEvent } from './commitToRangedAttack';
export { commitToRangedAttackEventSchema } from './commitToRangedAttack';

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
