import type { UnitInstance } from '@entities';
import { isSameUnitInstance } from './unitEquivalence';

/**
 * Returns a new array containing all units except the one matching the given unit by value.
 * Does not throw if the unit is not in the set; the result is simply unchanged.
 *
 * @param units - The array to copy
 * @param unit - The unit to leave out
 * @returns A new array without a value match
 */
export function arrayWithoutUnit(
  units: readonly UnitInstance[],
  unit: UnitInstance,
): UnitInstance[] {
  const remaining = units.filter(
    (member) => !isSameUnitInstance(member, unit).result,
  );
  return remaining;
}
