// Game modes
export { gameModeNameSchema, gameModeNames, gameModes, gameModeSchema } from './gameModes';
export type { GameMode, GameModeName } from './gameModes';

// Players
export { playerSchema, playerSideSchema, playerSides } from './player';
export type { Player, PlayerSide } from './player';

// Board
export {
  boardSchema, boardSpaceSchema, boardType, boardTypeEnum, coordinateSchema,
  getCoordinateLayout, largeCoordinateLayout, smallCoordinateLayout, standardCoordinateLayout,
} from './board';
export type {
  Board, BoardSpace, BoardType, Coordinate, CoordinateLayout, CoordinateLayoutMap,
} from './board';

// Units
export {
  diagonalFacings, orthogonalFacings, unitFacings, unitFacingSchema,
  unitInstanceSchema, unitStatNames, unitStatsSchema, unitTypeSchema,
} from './unit';
export type { UnitFacing, UnitInstance, UnitStatName, UnitStats, UnitType } from './unit';

// Unit presence
export {
  engagedUnitPresenceSchema, noneUnitPresenceSchema, singleUnitPresenceSchema,
  unitPresenceSchema, unitPresenceType,
} from './unitPresence';
export type {
  EngagedUnitPresence, NoneUnitPresence, SingleUnitPresence, UnitPresence, UnitPresenceType,
} from './unitPresence';

// Unit location
export { unitPlacementSchema, unitWithPlacementSchema } from './unitLocation';
export type { UnitPlacement, UnitWithPlacement } from './unitLocation';

// Cards
export {
  commandCardSchema, commandSchema, commandSizes, commandTypes, hiddenCardSchema,
  modifierSchema, restrictionsSchema, roundEffectSchema, statModifierSchema, statModifiers,
} from './card';
export type {
  Command, CommandCard, CommandSize, CommandType, HiddenCard, Modifier, Restrictions,
  RoundEffect, StatModifier, UnitSupport,
} from './card';

// Army
export { armySchema, unitCountSchema } from './army';
export type { Army, UnitCount } from './army';

// Attack types
export { attackTypeSchema, attackTypes } from './attackType';
export type { AttackType } from './attackType';

// Engagement types
export { engagementType, engagementTypeSchema } from './engagementType';
export type { EngagementType } from './engagementType';

// Lines
export { lineSchema } from './line';
export type { Line } from './line';

// Type guards
export { areSameSide, hasEngagedUnits, hasNoUnit, hasSingleUnit } from './typeGuards';
