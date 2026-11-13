// Game modes
export {
  gameModeNameSchema,
  gameModeNames,
  gameModes,
  gameModeSchema,
} from './gameModes';
export type { GameMode, GameModeName } from './gameModes';

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
  coordinateSchema,
  largeBoardColumnNumbers,
  largeBoardRowLetters,
  smallBoardColumnNumbers,
  smallBoardRowLetters,
  standardBoardColumnNumbers,
  standardBoardRowLetters,
} from './board';
export type {
  Board,
  BoardSpace,
  BoardType,
  Coordinate,
  CoordinateLayout,
  CoordinateLayoutMap,
  LargeBoardColumnNumber,
  LargeBoardRowLetter,
  SmallBoardColumnNumber,
  SmallBoardRowLetter,
  StandardBoardColumnNumber,
  StandardBoardRowLetter,
} from './board';

// Units
export {
  diagonalFacings,
  orthogonalFacings,
  unitFacings,
  unitFacingSchema,
  unitInstanceSchema,
  unitStatNames,
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
  moveDeltas,
  moveDeltaSchema,
  unitPlacementSchema,
  unitWithPlacementSchema,
} from './unitLocation';
export type {
  MoveDelta,
  MoveTurn,
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
  RoundEffect,
  UnitSupport,
} from './card';
export { unitSupportSchema } from './card';

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
