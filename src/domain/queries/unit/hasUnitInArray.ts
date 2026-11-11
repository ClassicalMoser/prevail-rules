import type { UnitInstance } from '@entities';
import { isSameUnitInstance } from './unitEquivalence';

/**
 * Checks whether an array of units contains a unit by value equality
 * (playerSide, unitType, instanceNumber), not reference.
 *
 * @param units - The array to search
 * @param unit - The unit to find
 * @returns True when a member matches by value
 */
export function hasUnitInArray(
  units: readonly UnitInstance[],
  unit: UnitInstance,
): boolean {
  const found = units.some((member) => isSameUnitInstance(member, unit).result);
  return found;
}
