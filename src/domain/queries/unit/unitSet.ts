import type { UnitInstance } from "@entities";
import { isSameUnitInstance } from "@validation";

/**
 * Checks whether a set of units contains a unit by value equality
 * (playerSide, unitType, instanceNumber), not reference.
 */
export function hasUnitInSet(units: Set<UnitInstance>, unit: UnitInstance): boolean {
  return [...units].some((u) => isSameUnitInstance(u, unit).result);
}

/**
 * Returns a new set containing all units except the one matching the given unit by value.
 * Does not throw if the unit is not in the set; the result is simply unchanged.
 */
export function setWithoutUnit(units: Set<UnitInstance>, unit: UnitInstance): Set<UnitInstance> {
  return new Set([...units].filter((u) => !isSameUnitInstance(u, unit).result));
}
