// Setup: the army placed in its own zone (§3.5).
export { applySetupUnitsEvent } from './setupUnits';
// Phase 1: the card a player chooses to play (§4.1.1).
export { applyChooseCardEvent } from './applyChooseCardEvent';
// Phase 2: a commander's move (§4.2).
export { applyMoveCommanderEvent } from './applyMoveCommanderEvent';
// Phase 3 orders: the units or lines a card names (§4.3).
export { applyIssueCommandsEvent } from './issueCommands';
// A Move order: the unit named to move next, and the move written for it
// (§4.3.10).
export { applyChooseMovingUnitEvent, applyMoveUnitEvent } from './moveUnit';
// A Shoot order: the unit named to shoot next, and its target and supporters
// (§4.3.11, §7.4).
export {
  applyChooseShooterEvent,
  applyPerformRangedAttackEvent,
} from './performRangedAttack';
// A commitment, at each moment one is asked for: a melee (§7.2.2), a move
// (§8.4), a shot and its target (§4.3.11 steps 2 and 5).
export {
  applyCommitToMeleeEvent,
  applyCommitToMovementEvent,
  applyCommitToRangedAttackEvent,
  applyCommitToRangedDefenseEvent,
} from './commitment';
// A front engagement's defender falling back or standing (§6.3.2), and the
// retreat its owner chooses (§9.1.3).
export {
  applyChooseWhetherToRetreatEvent,
  applyChooseRetreatOptionEvent,
} from './retreat';
// Phase 4: the engagement the first player chooses to fight next (§4.4.2).
export { applyChooseMeleeEvent } from './applyChooseMeleeEvent';
// A rout's Morale paid in cards (§9.3.2).
export { applyChooseRoutDiscardEvent } from './applyChooseRoutDiscardEvent';
// Cleanup: whether to rally (§10.3), and the support it lends (§10.4).
export { applyChooseRallyEvent } from './applyChooseRallyEvent';
export { applyAssignUnitSupportEvent } from './assignUnitSupport';
