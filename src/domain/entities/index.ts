// Army models.
export { armySchema } from './army';
export type { Army, UnitCount } from './army';

// Attack types.
export { attackTypes, attackTypeSchema } from './attackType';
export type { AttackType } from './attackType';

// Board models.
export {
  boardCoordinateSchema,
  boardSchema,
  boardSizeEnum,
  boardSpaceSchema,
  coordinateLayoutMap,
  getCoordinateLayout,
  largeBoardSchema,
  largeCoordinateLayout,
  smallBoardSchema,
  smallCoordinateLayout,
  standardBoardSchema,
  standardCoordinateLayout,
} from './board';
export type {
  Board,
  BoardCoordinate,
  BoardSize,
  BoardSpace,
  BoardType,
  CoordinateLayout,
  CoordinateLayoutMap,
  LargeBoard,
  LargeBoardCoordinate,
  SmallBoard,
  SmallBoardCoordinate,
  StandardBoard,
  StandardBoardCoordinate,
} from './board';

// Card models.
export {
  cardSchema,
  cardStateSchema,
  commandSchema,
  modifierSchema,
  playerCardStateSchema,
  restrictionsSchema,
  roundEffectSchema,
  statModifiers,
  statModifierSchema,
} from './card';
export type {
  Card,
  CardState,
  Command,
  CommandType,
  Modifier,
  PlayerCardState,
  Restrictions,
  RoundEffect,
  StatModifier,
} from './card';

// Engagement types.
export { engagementType, engagementTypeSchema } from './engagementType';
export type { EngagementType } from './engagementType';

// Expected event models.
export {
  expectedEventInfoSchema,
  expectedGameEffectSchema,
  expectedPlayerInputSchema,
  playerSources,
  playerSourceSchema,
} from './expectedEvent';
export type {
  ExpectedEventInfo,
  ExpectedGameEffect,
  ExpectedPlayerInput,
  PlayerSource,
} from './expectedEvent';

// Game models.
export { gameSchema } from './game';
export type { Game } from './game';

// Game types.
export { gameType, gameTypeEnum, gameTypeStructureSchema } from './gameType';
export type { GameType, GameTypeStructure } from './gameType';

// Line models.
export { lineSchema } from './line';
export type { Line } from './line';

// Player models.
export { playerSchema, playerSides, playerSideSchema } from './player';
export type { Player, PlayerSide } from './player';

// Sequence models.
export { attackResultSchema } from './sequence';
export type { AttackResult } from './sequence';

export {
  commitmentSchema,
  completedCommitmentSchema,
  declinedCommitmentSchema,
  pendingCommitmentSchema,
} from './sequence';
export type {
  Commitment,
  CompletedCommitment,
  DeclinedCommitment,
  PendingCommitment,
} from './sequence';

// Game state models.
export { gameStateSchema } from './sequence';
export type { GameState } from './sequence';

// Phases models.
export {
  CLEANUP_PHASE,
  cleanupPhaseStateSchema,
  cleanupPhaseSteps,
  ISSUE_COMMANDS_PHASE,
  issueCommandsPhaseStateSchema,
  issueCommandsPhaseSteps,
  MOVE_COMMANDERS_PHASE,
  moveCommandersPhaseStateSchema,
  moveCommandersPhaseSteps,
  phases,
  phaseStateSchema,
  PLAY_CARDS_PHASE,
  playCardsPhaseStateSchema,
  playCardsPhaseSteps,
  RESOLVE_MELEE_PHASE,
  resolveMeleePhaseStateSchema,
  resolveMeleePhaseSteps,
} from './sequence';
export type {
  CleanupPhaseState,
  CleanupPhaseStep,
  IssueCommandsPhaseState,
  IssueCommandsPhaseStep,
  MoveCommandersPhaseState,
  MoveCommandersPhaseStep,
  Phase,
  PhaseState,
  PlayCardsPhaseState,
  PlayCardsPhaseStep,
  ResolveMeleePhaseState,
  ResolveMeleePhaseStep,
} from './sequence';

// Round state models.
export { roundStateSchema } from './sequence';
export type { RoundState } from './sequence';

// Substeps models.
export {
  attackApplyStateSchema,
  commandResolutionStateSchema,
  engagementResolutionStateSchema,
  engagementStateSchema,
  flankEngagementResolutionStateSchema,
  frontEngagementResolutionStateSchema,
  meleeResolutionStateSchema,
  movementResolutionStateSchema,
  rallyResolutionStateSchema,
  rangedAttackResolutionStateSchema,
  rearEngagementResolutionStateSchema,
  retreatStateSchema,
  reverseStateSchema,
  routStateSchema,
} from './sequence';
export type {
  AttackApplyState,
  CommandResolutionState,
  EngagementResolutionState,
  EngagementState,
  FlankEngagementResolutionState,
  FrontEngagementResolutionState,
  MeleeResolutionState,
  MovementResolutionState,
  RallyResolutionState,
  RangedAttackResolutionState,
  RearEngagementResolutionState,
  RetreatState,
  ReverseState,
  RoutState,
} from './sequence';

// Type guards.
export {
  areSameSide,
  hasEngagedUnits,
  hasNoUnit,
  hasSingleUnit,
} from './typeGuards';

// Unit models.
export {
  diagonalFacings,
  orthogonalFacings,
  unitFacings,
  unitFacingSchema,
  unitInstanceSchema,
  unitStatsSchema,
  unitTypeSchema,
} from './unit';
export type {
  UnitFacing,
  UnitInstance,
  UnitStatName,
  UnitStats,
  UnitType,
} from './unit';

// Unit locations.
export { unitPlacementSchema, unitWithPlacementSchema } from './unitLocation';
export type { UnitPlacement, UnitWithPlacement } from './unitLocation';

// Unit presence models.
export {
  engagedUnitPresenceSchema,
  noneUnitPresenceSchema,
  singleUnitPresenceSchema,
  unitPresenceSchema,
  unitPresenceType,
} from './unitPresence';
export type {
  EngagedUnitPresence,
  NoneUnitPresence,
  SingleUnitPresence,
  UnitPresence,
  UnitPresenceType,
} from './unitPresence';

// Validation results.
export {
  failValidationResultSchema,
  passValidationResultSchema,
  validationResultSchema,
} from './validationResult';
export type {
  FailValidationResult,
  PassValidationResult,
  ValidationResult,
} from './validationResult';
