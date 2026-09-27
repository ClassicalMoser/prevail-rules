// Defense-stat check.
export { isDefenseStat } from './isDefenseStat';

// Same side as another unit.
export { isFriendlyUnit } from './isFriendlyUnit';

// Trait and unit-type restrictions.
export { matchesUnitRequirements } from './matchesUnitRequirements';

// Membership in a unit list.
export { arrayWithoutUnit, hasUnitInArray } from './unitArray';

// Membership in a unit set.
export { hasUnitInSet, setWithoutUnit } from './unitSet';

// A unit's stat after range and commander effects.
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
