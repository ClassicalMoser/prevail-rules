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

// Game types.
export { gameType, gameTypeEnum, gameTypeStructureSchema } from './gameType';

export type { GameType, GameTypeStructure } from './gameType';

// Line models.
export { lineSchema } from './line';

export type { Line } from './line';
// Player models.
export { playerSchema, playerSides, playerSideSchema } from './player';

export type { Player, PlayerSide } from './player';
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
// Game effect literals (re-export; source is `gameEffectTypes` in @ruleValues — leaf, no cycle).
export { gameEffects, type GameEffectType } from '@ruleValues';
