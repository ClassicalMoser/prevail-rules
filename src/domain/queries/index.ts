// Attack totals and melee support.
export { applyAttackValue, getMeleeSupportValue } from './attack';

// Board geometry, occupancy of a coordinate, and a clear diagonal.
export {
  diagonalIsClear,
  getAdjacentSpaces,
  getBackSpaces,
  getBoardCoordinates,
  getBoardCoordinatesWithEngagedUnits,
  getBoardSpace,
  getCommanderSpace,
  getDiagonallyAdjacentSpaces,
  getFlankingSpaces,
  getForwardSpace,
  getForwardSpacesToEdge,
  getFrontSpaces,
  getInlineSpaces,
  getOrthogonallyAdjacentSpaces,
  getRearwardSpace,
  getSingleUnitWithPlacementAtCoordinate,
  getSpacesAhead,
  getSpacesBehind,
  getSpacesInArc,
  getHalfPlaneInDirection,
  getSpacesWithinDistance,
} from './board';

// Card piles, initiative, and command equality.
export {
  areModifiersEqual,
  areModifiersArraysEqual,
  areRestrictionsEqual,
  calculateInitiative,
  findMatchingCommand,
  getHiddenPlayerCardState,
  getOwnedPlayerCardState,
  modifiersFromCompletedCommitment,
} from './card';

// Front, flank, and rear, including movement engagements.
export {
  getEngagementStateFromMovement,
  getFrontEngagementStateFromMovement,
  getFlankEngagementStateFromMovement,
  getRearEngagementStateFromMovement,
  isEngagementFromFront,
  isEngagementFromFlank,
  isEngagementFromRear,
} from './engagement';

// Opposite, left, right, neighbors, and the diagonal check.
export {
  getOppositeFacing,
  getLeftFacing,
  getRightFacing,
  getAdjacentFacings,
  getOrthogonalFacings,
  isDiagonalFacing,
} from './facings';

// Empty hand or an unpayable rout discard.
export {
  getGameOverWinner,
  getWinnerFromEmptyHands,
  getWinnerFromUnpayableRoutDiscard,
} from './gameOver';

// Command lines.
export { getLinesFromUnit, isValidLine } from './line';

// The other seat.
export { getOtherPlayer } from './player';

// Where the turn is, and the substep currently in progress.
export {
  canReverseUnit,
  findRetreatState,
  getAttackApplyStateFromMelee,
  getAttackApplyStateFromRangedAttack,
  getAwaitingRoutDiscardState,
  getCleanupPhaseState,
  getCurrentCommandResolutionState,
  getCurrentInitiative,
  getCurrentPhaseState,
  getCurrentRallyResolutionState,
  getDefendingPlayerForNextIncompleteMeleeAttackApply,
  getIssueCommandsPhaseState,
  getMeleeResolutionReadyForAttackCalculation,
  getMeleeResolutionState,
  getMoveCommandersPhaseState,
  getMovementResolutionState,
  getNextEventNumber,
  getNextStepForResolveRally,
  getPlayCardsPhaseState,
  getRallyResolutionState,
  getRallyResolutionStateAwaitingBurn,
  getRallyResolutionStateAwaitingUnitSupport,
  getRallyResolutionStateForCurrentStep,
  getRangedAttackResolutionState,
  getRemainingMeleeEngagements,
  getResolveMeleePhaseState,
  getRetreatStateFromAttackApply,
  getRetreatStateFromFrontEngagement,
  getRetreatStateFromMelee,
  getRetreatStateFromRangedAttack,
  getRetreatStateReadyForResolveFromMelee,
  getReverseStateFromAttackApply,
  getReverseStateFromMeleeResolutionByInitiative,
  getRoutStateFromAttackApply,
  getRoutStateFromCleanupPhaseForResolveRout,
  getRoutStateFromMeleeResolutionByInitiative,
  getRoutStateFromRally,
  getRoutStateFromRearEngagement,
} from './sequencing';

// Unit stats, identity, support, and who is on the board.
export {
  arrayWithoutUnit,
  getCurrentUnitStat,
  getPlayerUnitsOnBoard,
  getPlayerUnitsWithPlacementOnBoard,
  hasUnitInArray,
  hasUnitInSet,
  isDefenseStat,
  isFriendlyUnit,
  isSameInstanceNumber,
  isSameUnitInstance,
  isSameUnitType,
  matchesUnitRequirements,
  setWithoutUnit,
  unitMatchesSupport,
} from './unit';

// Where a unit is standing, and whether an enemy occupies the space.
export {
  getPlayerUnitWithPosition,
  getPositionOfUnit,
  hasEnemyUnit,
  isAtPlacement,
} from './unitPresence';
