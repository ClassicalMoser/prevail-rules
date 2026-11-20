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
export { getLegalChooseCardOptions } from './getLegalChooseCardOptions';
export { getLegalChooseMeleeResolutionEvents } from './getLegalChooseMeleeResolutionEvents';
export { getLegalChooseRallyEvent } from './getLegalChooseRallyEvent';
export { getLegalChooseRetreatOptionEvents } from './getLegalChooseRetreatOptionEvents';
export { getLegalChooseWhetherToRetreatEvents } from './getLegalChooseWhetherToRetreatEvents';
export { getLegalCommitToMeleeEvents } from './getLegalCommitToMeleeEvents';
export { getLegalCommitToMovementEvents } from './getLegalCommitToMovementEvents';
export { getLegalCommitToRangedAttackEvents } from './getLegalCommitToRangedAttackEvents';
export { getLegalCommitToRangedDefenseEvents } from './getLegalCommitToRangedDefenseEvents';
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
export { getLegalMoveUnits, type LegalMoveUnits } from './getLegalMoveUnits';
export {
  getLegalRoutDiscardCards,
  type LegalRoutDiscardCards,
} from './getLegalRoutDiscardCards';
export {
  getLegalSetupUnits,
  getSetupZoneCoordinates,
  SETUP_ZONE_BACK_ROWS,
  SETUP_ZONE_EXCLUDED_SIDE_RANKS,
  type LegalSetupUnits,
} from './setupUnits';
export {
  canUnitRangedAttackTarget,
  getLegalShooterTargets,
  getLegalRangedAttackers,
  getLegalRangedAttackSupporters,
  getLegalRangedAttackTargets,
  type LegalShooterTargets,
  type LegalRangedAttackers,
} from './performRangedAttack';
