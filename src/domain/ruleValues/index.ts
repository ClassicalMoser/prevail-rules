// Numeric catalogs: initiative, line length, flexibility, and army limits per mode.
export {
  COMMANDER_MOVE_DISTANCE,
  EPIC_ARMY_CARDS_PER_INITIATIVE_COUNT,
  EPIC_MAX_ARMY_COST,
  EPIC_MAX_ARMY_UNIT_TYPE_COUNT,
  EPIC_MIN_ARMY_MORALE_VALUE,
  LEGAL_INITIATIVES,
  MAX_ARMY_UNIT_PER_TYPE_COUNT,
  MAX_INITIATIVE_VALUE,
  MAX_LINE_LENGTH,
  MIN_FLEXIBILITY_THRESHOLD,
  MIN_INITIATIVE_VALUE,
  NO_INSPIRATION_RANGE,
  MINI_ARMY_CARDS_PER_INITIATIVE_COUNT,
  MINI_MAX_ARMY_COST,
  MINI_MAX_ARMY_UNIT_TYPE_COUNT,
  MINI_MIN_ARMY_MORALE_VALUE,
  STANDARD_ARMY_CARDS_PER_INITIATIVE_COUNT,
  STANDARD_MAX_ARMY_COST,
  STANDARD_MAX_ARMY_UNIT_TYPE_COUNT,
  STANDARD_MIN_ARMY_MORALE_VALUE,
} from './ruleValues';

// What each moment a card may be committed at accepts (§8.4).
export {
  MELEE_COMMITMENT_MODIFIERS,
  MOVEMENT_COMMITMENT_MODIFIERS,
  RANGED_ATTACK_COMMITMENT_MODIFIERS,
  RANGED_DEFENSE_COMMITMENT_MODIFIERS,
} from './commitmentModifiers';

// Every stat a card may name: those the moments above accept.
export { statModifiers, statModifierSchema } from './commitmentModifiers';
export type { StatModifier } from './commitmentModifiers';

// Unit traits.
export { traits, traitSchema } from './traits';
export type { Trait } from './traits';

// Game-effect type names.
export { gameEffects } from './gameEffectTypes';
export type { GameEffectType } from './gameEffectTypes';

// Board sizes, the labels on their rows and columns, every space, and each
// size's depth, frontage and spaces (§2.1.3).
export { boardType, boardTypeEnum } from './boardSizes';
export type { BoardType } from './boardSizes';
export { boardColumnNumbers, boardRowLetters } from './boardLabels';
export type { BoardColumnNumber, BoardRowLetter } from './boardLabels';
export { allCoordinates, coordinateSchema } from './boardCoordinates';
export type { Coordinate } from './boardCoordinates';
export { coordinateLayoutMap } from './boardLayouts';
export type { CoordinateLayout, CoordinateLayoutMap } from './boardLayouts';

// Game modes, and which board size each is played on (§3.1.3).
export { gameModeNames, gameModeNameSchema, gameModes } from './gameModes';
export type { GameMode, GameModeName } from './gameModes';
