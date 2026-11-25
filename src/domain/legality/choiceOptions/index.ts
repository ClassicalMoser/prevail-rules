// Unit support after a rally (§10.4): the places a hand holds, offered a
// unit at a time, and the refusal words for a choice that breaks them.
export {
  combineSupportCategoriesFromHand,
  getAssignmentRefusalReason,
  getUnitSupportLabel,
  getLegalAssignUnitSupport,
  getLegalUnitSupportAssignments,
  isSameUnitSupportAssignment,
  type LegalAssignUnitSupport,
  type LegalSupportCategory,
} from './assignUnitSupport';
// Phase 1: each card a player still choosing may play (§4.1.1).
export { getLegalChooseCardOptions } from './getLegalChooseCardOptions';
// Phase 4: the engagement the first player may fight next (§4.4.2).
export { getLegalChooseMeleeResolutionEvents } from './getLegalChooseMeleeResolutionEvents';
// Cleanup: whether the player may rally, or only decline (§10.3).
export { getLegalChooseRallyEvent } from './getLegalChooseRallyEvent';
// A retreat (§9.1.3), or the choice whether to fall back from a front
// engagement (§6.3.2): what its owner may choose.
export {
  getLegalChooseRetreatOptionEvents,
  getLegalChooseWhetherToRetreatEvents,
} from './retreat';
// A commitment, at each moment one is asked for: a melee (§7.2.2), a move
// (§8.4), a shot and its target (§4.3.11 steps 2 and 5).
export {
  getLegalCommitToMeleeEvents,
  getLegalCommitToMovementEvents,
  getLegalCommitToRangedAttackEvents,
  getLegalCommitToRangedDefenseEvents,
} from './commitment';
// Phase 3 orders (§4.3): what a card may order, the units or lines it may
// name, and the refusal words for an order that breaks them.
export {
  getLegalIssueCommands,
  getLegalLines,
  findLegalLine,
  listsWholeLine,
  getLineRefusalReason,
  getLegalUnitsToOrder,
  getUnitsOrderRefusalReason,
  getLegalLinesToOrder,
  getLinesOrderRefusalReason,
  getLegalUnitsForIssueCommand,
  isCommandIssuable,
  type LegalIssueCommands,
  type LegalLine,
} from './issueCommands';
// The ordered units a player may name to move next (§4.3.10 step 1).
export { getLegalMoveUnits, type LegalMoveUnits } from './moveUnit';
// A rout's Morale payment: who pays, how many, and from which cards (§9.3.2).
export {
  getLegalRoutDiscardCards,
  type LegalRoutDiscardCards,
} from './getLegalRoutDiscardCards';
// Setup: where each side may deploy its army (§3.5.4).
export {
  getLegalSetupUnits,
  getSetupZoneCoordinates,
  SETUP_ZONE_BACK_ROWS,
  SETUP_ZONE_EXCLUDED_SIDE_RANKS,
  type LegalSetupUnits,
} from './setupUnits';
// A Shoot order (§4.3.11, §7.4): who may shoot, at whom, and who may support.
export {
  canUnitRangedAttackTarget,
  getLegalShooterTargets,
  getLegalRangedAttackers,
  getLegalRangedAttackSupporters,
  getLegalRangedAttackTargets,
  type LegalShooterTargets,
  type LegalRangedAttackers,
} from './performRangedAttack';
