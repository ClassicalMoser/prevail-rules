// Defense-stat check.
export { isDefenseStat } from './isDefenseStat';

// Same side as another unit.
export { isFriendlyUnit } from './isFriendlyUnit';

// Trait and unit-type id lists.
export { matchesUnitRequirements } from './matchesUnitRequirements';

// A unit type against one restriction variant.
export { unitTypeMatchesRestrictions } from './unitTypeMatchesRestrictions';

// Membership in a unit list, by value rather than reference.
export { hasUnitInArray } from './hasUnitInArray';
export { arrayWithoutUnit } from './arrayWithoutUnit';

// Membership in a unit set, by value rather than reference.
export { hasUnitInSet } from './hasUnitInSet';
export { setWithoutUnit } from './setWithoutUnit';

// A unit's stat after round, command, and extra modifiers.
export { getCurrentUnitStat } from './getCurrentUnitStat';

// Whether a unit fits a support grant.
export { unitMatchesSupport } from './unitMatchesSupport';

// Units of one side currently on the board.
export { getPlayerUnitsOnBoard } from './getPlayerUnitsOnBoard';

// Those units with the coordinate and facing they occupy.
export { getPlayerUnitsWithPlacementOnBoard } from './getPlayerUnitsWithPlacementOnBoard';

// Same type, same instance number, same instance.
export {
  isSameInstanceNumber,
  isSameUnitInstance,
  isSameUnitType,
} from './unitEquivalence';
