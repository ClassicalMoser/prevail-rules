// Attack totals and melee support.
export { applyAttackValue, getMeleeSupportValue } from './attack';

// Board geometry, occupancy of a coordinate, and a clear diagonal.
export {
  diagonalIsClear,
  getAdjacentSpaces,
  getBackSpaces,
  getNeighbourSide,
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
  getStepFacing,
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
  areCommandsEqual,
  areUnitSupportsEqual,
  isSameCard,
  isSameCardValue,
  calculateInitiative,
  findMatchingCommand,
  getHiddenPlayerCardState,
  findOwnedPlayerCardState,
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

// Opposite, left, right, neighbors, one turn's reach, and the diagonal check.
export {
  getOppositeFacing,
  getLeftFacing,
  getRightFacing,
  getAdjacentFacings,
  getOrthogonalFacings,
  getFacingsOneTurnAway,
  getTurnedFacing,
  isDiagonalFacing,
} from './facings';

// Empty hand, an unpayable rout discard, or an army destroyed to the last unit.
export {
  getWinnerFromEmptyHands,
  getWinnerFromUnpayableRoutDiscard,
  getWinnerFromNoUnits,
  getGameOverWinner,
  isChoosingCardsInSecret,
} from './gameOver';

// Command lines present on the board from a unit.
export { canJoinLine, getLineSegmentContainingUnit } from './line';

// The other seat.
export { getOtherPlayer } from './player';
export { hasInitiative } from './player';

// Where the turn is, and the substep currently in progress.
export {
  getCurrentPhaseState,
  getPlayCardsPhaseState,
  getMoveCommandersPhaseState,
  getMoveCommandersStepFrom,
  getIssueCommandsPhaseState,
  getResolveMeleePhaseState,
  getCleanupPhaseState,
  getCurrentStep,
  getCurrentInitiative,
  getCurrentEventStream,
  getCurrentCommandResolutionState,
  getMovementResolutionState,
  getRangedAttackResolutionState,
  getMeleeAppliesInResolutionOrder,
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
  getRallyingPlayer,
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
  findRetreatAwaitingMove,
  findRetreatAwaitingRout,
  findRetreatLocation,
  getFrontEngagementRetreatState,
  findRetreatState,
  getRetreatState,
  findRoutAwaitingPenalty,
  findRoutLocation,
  findRoutOwingDiscard,
  findRoutState,
  isAwaitingRoutDiscard,
  getRoutState,
  getRoutStateFromAttackApply,
  getNextMeleeRoutState,
  getRearEngagementRoutState,
} from './sequencing';
export type {
  RetreatLocation,
  RetreatSource,
  RoutLocation,
} from './sequencing';

// Unit stats, identity, support, and who is on the board.
export {
  arrayWithoutUnit,
  getCurrentUnitStat,
  getRawUnitStat,
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

// Whether two placements, or two units with their placements, are the same;
// and where a path of steps and turns leaves a unit.
export {
  getPlacementAfterPath,
  isSameMovePath,
  isSamePlacement,
  isSameUnitWithPlacement,
} from './unitLocation';

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
