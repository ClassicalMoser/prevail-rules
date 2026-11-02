import type { UnitInstance } from '@entities';
import { isSameUnitInstance } from './unitEquivalence';

/**
 * Returns a new set containing all units except the one matching the given unit by value.
 * Does not throw if the unit is not in the set; the result is simply unchanged.
 *
 * @param units - The set to copy
 * @param unit - The unit to leave out
 * @returns A new set without a value match
 */
export function setWithoutUnit(
  units: Set<UnitInstance>,
  unit: UnitInstance,
): Set<UnitInstance> {
  const remaining = new Set(
    [...units].filter((member) => !isSameUnitInstance(member, unit).result),
  );
  return remaining;
}
