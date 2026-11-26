// Stand-in unit types from the catalog, reached by a stat or by traits.
export { getUnitByStatValue } from './getUnitByStatValue';
export { getUnitByTrait } from './getUnitByTrait';

// Stand-in units, chosen by type or by the stats a spec asks for.
export { createTestUnit, createUnitByStat } from './unitHelpers';

// Cards, units with where they stand, and readers of what the rules offer.
export {
  coordinatesOfSegment,
  createTestCard,
  createTestCommand,
  createUnitWithPlacement,
  getCardsByCount,
  hasMove,
  enemyBlockingStraightBack,
  enemyCuttingOffRetreat,
  legalRetreatsOf,
  placed,
  updateCardState,
} from './testHelpers';

// Boards holding the units a spec sets down, and new games around them.
export {
  createBoardWithCommander,
  createBoardWithEngagedUnits,
  createBoardWithFacingRow,
  createBoardWithSingleUnit,
  createBoardWithUnits,
  createGameStateWithBoard,
  createGameStateWithEngagedUnits,
  createGameStateWithSingleUnit,
  createGameStateWithUnits,
} from './createBoard';

// A new game from a shorthand list of where each unit stands.
export { createGameState } from './bootstrapGameState';

// A whole new board put into a game state, its index worked out afresh.
export { replaceBoard } from './replaceBoard';

// A game state with these units waiting in reserve, filed there.
export { withReservedUnits } from './withReservedUnits';

// A game state with one side's commander defeated.
export { withLostCommander } from './withLostCommander';

// Phase and substep shells, and games in Phase 3 or 4 around them.
export {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithRetreat,
  createAttackApplyStateWithRetreatAndReverse,
  createAttackApplyStateWithReverse,
  createAttackApplyStateWithRout,
  createCleanupPhaseState,
  createCleanupPhaseStateWithRallyRout,
  createFlankEngagementState,
  createFrontEngagementState,
  createGameStateMovingInto,
  createGameStateResolvingCommand,
  createGameStateResolvingMelee,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createMoveCommandersPhaseState,
  createMovementResolutionState,
  createPlayCardsPhaseState,
  createRallyResolutionState,
  createRangedAttackResolutionState,
  createRearEngagementState,
  createResolveMeleePhaseState,
  createRetreatState,
  createReverseState,
  createRoutState,
} from './phaseStateHelpers';

// A game on a player's rally, with a rout owing a known discard.
export { withRoutOwing } from './withRoutOwing';

// Playable games, played forward by the engines to the point a rule is met.
export {
  applyEffectsUntilChoice,
  createPlayableGame,
  readyToAimShot,
  readyToWriteMove,
  resolvingMoveOrder,
  resolvingShootOrder,
} from './scenario';

// A state for each game effect that reaches its procedure.
export { procedureRegistryStateFactories } from './procedureRegistryStateFactories';
