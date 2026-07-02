export { eachCardPresentOnce, eachUnitPresentOnce } from './gameState';
export { isLegalCardChoice } from './isLegalCardChoice';
export { isLegalCommanderMove } from './isLegalCommanderMove';
export {
  isValidChooseCardEvent,
  isValidChooseMeleeResolutionEvent,
  isValidChooseRallyEvent,
  isValidChooseRoutDiscardEvent,
  isValidMoveCommanderEvent,
  validatePlayerChoice,
} from './playerChoice';
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
