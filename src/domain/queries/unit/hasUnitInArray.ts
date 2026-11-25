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
  // Matched on who the unit is, so a copy named by an event is found: a unit
  // already commanded this round cannot take a second order (§4.3.6).
  const found = units.some((member) => isSameUnitInstance(member, unit));
  return found;
}
