export { eachCardPresentOnce, eachUnitPresentOnce } from './gameState';
export {
  getLegalPlayerChoiceOptions,
  isValidAssignUnitSupportEvent,
  isValidChooseCardEvent,
  isValidChooseMeleeResolutionEvent,
  isValidChooseRallyEvent,
  isValidChooseRetreatOptionEvent,
  isValidChooseRoutDiscardEvent,
  isValidChooseWhetherToRetreatEvent,
  isValidCommitToMeleeEvent,
  isValidCommitToMovementEvent,
  isValidCommitToRangedAttackEvent,
  isValidDoneIssuingCommandsEvent,
  isValidIssueCommandEvent,
  isValidMoveCommanderEvent,
  isValidMoveUnitEvent,
  isValidPerformRangedAttackEvent,
  isValidSetupUnitsEvent,
  validatePlayerChoice,
} from './playerChoice';
export type { LegalPlayerChoiceOptions } from './playerChoice';
export {
  canEngageEnemy,
  canMoveInto,
  canMoveThrough,
  isLegalMove,
} from '@legality';
export { validateEvent } from './validateEvent';

// Re-exports during migration — prefer importing from @queries
export {
  diagonalIsClear,
  isValidLine,
  areModifiersArraysEqual,
  areModifiersEqual,
  areRestrictionsEqual,
  isSameInstanceNumber,
  isSameUnitInstance,
  isSameUnitType,
  isAtPlacement,
  isDiagonalFacing,
  matchesUnitRequirements,
  hasEnemyUnit,
  isDefenseStat,
} from '@queries';
