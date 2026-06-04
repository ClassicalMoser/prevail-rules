import type { UnitInstance } from '@entities';
import { isSameUnitInstance } from '@validation';

/**
 * Checks whether an array of units contains a unit by value equality
 * (playerSide, unitType, instanceNumber), not reference.
 */
export function hasUnitInArray(
  units: UnitInstance[],
  unit: UnitInstance,
): boolean {
  return units.some((u) => isSameUnitInstance(u, unit).result);
}

/**
 * Returns a new array containing all units except the one matching the given unit by value.
 * Does not throw if the unit is not in the set; the result is simply unchanged.
 */
export function arrayWithoutUnit(
  units: UnitInstance[],
  unit: UnitInstance,
): UnitInstance[] {
  return units.filter((u) => !isSameUnitInstance(u, unit).result);
}
