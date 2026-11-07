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
  isAuthoritativeGameState,
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
  getRallyStepRoutState,
  getRallyResolutionStateForCurrentStep,
  getRallyResolutionStateAwaitingBurn,
  getRallyResolutionStateAwaitingUnitSupport,
  getIsFirstPlayerForResolveRallyStep,
  getNextStepForResolveRally,
  isOpenSubstep,
  getRangedAttackApplyState,
  getAttackApplyStateAt,
  getMeleeAttackApplyState,
  findNextMeleeDefendingPlayer,
  getReverseStateFromAttackApply,
  getNextMeleeReverseState,
  getRetreatStateFromAttackApply,
  getRangedAttackRetreatState,
  getMeleeRetreatState,
  getRangedAttackRoutState,
  getMeleeRoutState,
  getRangedAttackReverseState,
  getMeleeReverseState,
  getNextMeleeRetreatStateAwaitingMove,
  getFrontEngagementRetreatState,
  findRetreatState,
  getRetreatState,
  findRoutState,
  isAwaitingRoutDiscard,
  getRoutState,
  getRoutStateFromAttackApply,
  getNextMeleeRoutState,
  getRearEngagementRoutState,
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

// What stands on a space, where a unit is standing, and whether an enemy
// occupies the space.
export {
  getPlayerUnitWithPosition,
  getPositionOfUnit,
  hasEngagedUnits,
  hasEnemyUnit,
  hasNoUnit,
  hasSingleUnit,
  isAtPlacement,
} from './unitPresence';
