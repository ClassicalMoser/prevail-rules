// Game modes, declared in `@ruleValues` and re-exported beside the game's
// other vocabulary.
export {
  boardSizeByGameMode,
  gameModeNameSchema,
  gameModeNames,
} from '@ruleValues';
export type { GameModeName } from '@ruleValues';

// Players
export { playerSchema, playerSideSchema, playerSides } from './player';
export type { Player, PlayerSide } from './player';

// Board
export {
  allCoordinates,
  boardSchema,
  boardSpaceSchema,
  boardType,
  boardTypeEnum,
  coordinateLayoutMap,
  coordinateSchema,
} from './board';
export type {
  Board,
  BoardSpace,
  BoardType,
  Coordinate,
  CoordinateLayout,
  CoordinateLayoutMap,
  GridPosition,
} from './board';

// Units
export {
  unitInstanceSchema,
  unitStatNames,
  unitStatsSchema,
  unitTypeSchema,
} from './unit';
export type { UnitInstance, UnitStatName, UnitStats, UnitType } from './unit';

// Unit presence
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

// Unit location
export {
  diagonalFacings,
  orthogonalFacings,
  unitFacings,
  unitFacingSchema,
  sideTurns,
  moveTurns,
  moveDeltas,
  moveDeltaSchema,
  unitPlacementSchema,
  unitWithPlacementSchema,
} from './unitLocation';
export type {
  UnitFacing,
  SideTurn,
  MoveTurn,
  MoveDelta,
  UnitPlacement,
  UnitWithPlacement,
} from './unitLocation';

// Cards
export {
  commandCardSchema,
  commandSchema,
  commandSizes,
  commandTypes,
  hiddenCardSchema,
  modifierSchema,
  noTypeRestrictionsSchema,
  traitRestrictionsSchema,
  unitTypeRestrictionsSchema,
  restrictionsSchema,
  roundEffectSchema,
} from './card';
export type {
  Command,
  CommandCard,
  CommandSize,
  CommandType,
  HiddenCard,
  Modifier,
  NoTypeRestrictions,
  TraitRestrictions,
  UnitTypeRestrictions,
  Restrictions,
  RestrictionType,
  RoundEffect,
  GenericUnitSupport,
  TraitUnitSupport,
  UnitTypeUnitSupport,
  UnitSupport,
  UnitSupportType,
} from './card';
export { unitSupportSchema } from './card';
// The kinds a restriction filters by, and the kinds of unit a card's support holds.
export { restrictionTypes, unitSupportTypes } from './card';

// How a player spends the command on their card in play: some units, or some lines
export {
  unitsAllocationSchema,
  linesAllocationSchema,
  commandAllocationSchema,
} from './commandAllocation';
export type {
  UnitsAllocation,
  LinesAllocation,
  CommandAllocation,
} from './commandAllocation';

// Army
export { armySchema, unitCountSchema } from './army';
export type { Army, UnitCount } from './army';

// Attack types
export { attackResultSchema } from './attackResult';
export type { AttackResult } from './attackResult';
export { attackTypeSchema, attackTypes } from './attackType';
export type { AttackType } from './attackType';

// Engagement types
export { engagementType, engagementTypeSchema } from './engagementType';
export type { EngagementType } from './engagementType';
