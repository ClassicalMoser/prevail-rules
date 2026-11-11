import type { UnitInstance } from '@entities';
import { isSameUnitInstance } from './unitEquivalence';

/**
 * Checks whether a set of units contains a unit by value equality
 * (playerSide, unitType, instanceNumber), not reference.
 *
 * Set membership is by reference, so this walks the members and compares by value.
 *
 * @param units - The set to search
 * @param unit - The unit to find
 * @returns True when a member matches by value
 */
export function hasUnitInSet(
  units: Set<UnitInstance>,
  unit: UnitInstance,
): boolean {
  const found = [...units].some((member) => isSameUnitInstance(member, unit));
  return found;
}
