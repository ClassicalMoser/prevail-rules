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
  getWinnerFromEmptyHands,
  getWinnerFromUnpayableRoutDiscard,
  getGameOverWinner,
} from './gameOver';

// Command lines present on the board from a unit.
export { getLinesFromUnit } from './line';

// The other seat.
export { getOtherPlayer } from './player';

// Where the turn is, and the substep currently in progress.
export {
  getCurrentPhaseState,
  getPlayCardsPhaseState,
  getMoveCommandersPhaseState,
  getIssueCommandsPhaseState,
  getResolveMeleePhaseState,
  getCleanupPhaseState,
  getCurrentStep,
  getCurrentInitiative,
  getCurrentEventStream,
  getNextEventNumber,
  getCurrentCommandResolutionState,
  getMovementResolutionState,
  getRangedAttackResolutionState,
  getMeleeResolutionState,
  getMeleeResolutionReadyForAttackCalculation,
  getRemainingMeleeEngagements,
  getRallyResolutionState,
  getCurrentRallyResolutionState,
  getRoutStateFromRally,
  getRoutStateFromCleanupPhaseForResolveRout,
  getRallyResolutionStateForCurrentStep,
  getRallyResolutionStateAwaitingBurn,
  getRallyResolutionStateAwaitingUnitSupport,
  getIsFirstPlayerForResolveRallyStep,
  getNextStepForResolveRally,
  getAttackApplyStateFromRangedAttack,
  getAttackApplyStateFromMelee,
  getDefendingPlayerForNextIncompleteMeleeAttackApply,
  getReverseStateFromAttackApply,
  getReverseStateFromMeleeResolutionByInitiative,
  canReverseUnit,
  getRetreatStateFromAttackApply,
  getRetreatStateFromRangedAttack,
  getRetreatStateFromMelee,
  getRetreatStateReadyForResolveFromMelee,
  getRetreatStateFromFrontEngagement,
  findRetreatState,
  getRoutStateFromAttackApply,
  getRoutStateFromMeleeResolutionByInitiative,
  getRoutStateFromRearEngagement,
  getAwaitingRoutDiscardState,
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
  unitTypeMatchesRestrictions,
} from './unit';

// Where a unit is standing, and whether an enemy occupies the space.
export {
  getPlayerUnitWithPosition,
  getPositionOfUnit,
  hasEnemyUnit,
  isAtPlacement,
} from './unitPresence';
