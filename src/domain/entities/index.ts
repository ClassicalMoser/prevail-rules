// Army models.
export {
  armyCompositionByMode,
  armyCompositionInitiatives,
  armySchema,
  armySchemaForMode,
  refineArmyComposition,
} from './army';
export type { Army, ArmyCompositionRules, UnitCount } from './army';

// Attack types.
export { attackTypes, attackTypeSchema } from './attackType';
export type { AttackType } from './attackType';

// Board models.
export {
  coordinateSchema,
  boardSchema,
  boardSpaceSchema,
  boardType,
  boardTypeEnum,
  coordinateLayoutMap,
  getCoordinateLayout,
  largeBoardCoordinateSchema,
  largeBoardCoordinates,
  largeCoordinateLayout,
  smallBoardCoordinateSchema,
  smallBoardCoordinates,
  smallCoordinateLayout,
  standardBoardCoordinateSchema,
  standardBoardCoordinates,
  standardCoordinateLayout,
} from './board';
export type {
  Board,
  BoardSpace,
  BoardType,
  CoordinateLayout,
  CoordinateLayoutMap,
  Coordinate,
} from './board';

// Card models.
export {
  cardSchema,
  cardStateSchema,
  ownedCardStateSchema,
  authoritativeCardStateSchema,
  whiteSeenCardStateSchema,
  blackSeenCardStateSchema,
  hiddenCardSchema,
  commandSchema,
  commandSizes,
  commandTypes,
  modifierSchema,
  restrictionsSchema,
  roundEffectSchema,
  statModifiers,
  statModifierSchema,
  unitSupportSchema,
} from './card';
export type {
  Card,
  CardState,
  OwnedCardState,
  HiddenCardState,
  AuthoritativeCardState,
  WhiteSeenCardState,
  BlackSeenCardState,
  HiddenCard,
  Command,
  CommandType,
  CommandSize,
  GenericUnitSupport,
  Modifier,
  Restrictions,
  RoundEffect,
  StatModifier,
  TraitUnitSupport,
  UnitSupport,
  UnitTypeUnitSupport,
} from './card';

// Engagement types.
export { engagementType, engagementTypeSchema } from './engagementType';
export type { EngagementType } from './engagementType';

// Game modes.
export {
  gameModes,
  gameModeNames,
  gameModeNameSchema,
  gameModeSchema,
} from './gameModes';
export type { GameMode, GameModeName } from './gameModes';

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
  unitStatNames,
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
