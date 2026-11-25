// Defense-stat check.
export { isDefenseStat } from './isDefenseStat';

// Whether a unit fights for this side.
// TODO(misleading): the line above says what `isFriendlyUnit` is, not
// `findUnitIndex`, which is where a unit stands in a list, by who it is.
// Settle by giving each its own comment, next to the other list readers.
export { findUnitIndex } from './findUnitIndex';
export { isFriendlyUnit } from './isFriendlyUnit';

// Trait and unit-type id lists.
export { matchesUnitRequirements } from './matchesUnitRequirements';

// Whether a card's inspiration range reaches a unit.
export { unitMatchesInspirationRange } from './unitMatchesInspirationRange';

// A unit type against one restriction variant.
export { unitTypeMatchesRestrictions } from './unitTypeMatchesRestrictions';

// Whether an order may name a unit at all (§4.3.4, §4.3.6).
export { canBeOrdered } from './canBeOrdered';

// Membership in a unit list, by value rather than reference.
export { hasUnitInArray } from './hasUnitInArray';
export { arrayWithoutUnit } from './arrayWithoutUnit';

// Membership in a unit set, by value rather than reference.
export { hasUnitInSet } from './hasUnitInSet';
export { setWithoutUnit } from './setWithoutUnit';

// A unit's stat after round, command, and extra modifiers.
export { getCurrentUnitStat } from './getCurrentUnitStat';

// The unfloored sum, for a total that adds more before its floor (§7.1.4).
export { getRawUnitStat } from './getRawUnitStat';

// Whether a unit fits a support grant.
export { unitMatchesSupport } from './unitMatchesSupport';

// A unit as the reserve holds it, before it deploys.
export { getReservedUnit } from './getReservedUnit';

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
