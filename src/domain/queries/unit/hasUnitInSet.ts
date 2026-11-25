import type { UnitInstance } from '@entities';
import { isSameUnitInstance } from './unitEquivalence';

/**
 * Checks whether a set of units contains a unit by value equality
 * (playerSide, unitType, instanceNumber), not reference.
 *
 * Set membership is by reference, so this walks the members and compares by value.
 *
 * TODO(composition): nothing in production calls this. `eachUnitPresentOnce`
 * in `@validation` searches its set of expected units by hand with the same
 * `isSameUnitInstance` match (it also deletes the member it finds). Settle by
 * having that check call this and `setWithoutUnit`, or by deleting both.
 *
 * @param units - The set to search
 * @param unit - The unit to find
 * @returns True when a member matches by value
 */
export function hasUnitInSet(
  units: Set<UnitInstance>,
  unit: UnitInstance,
): boolean {
  // Matched on who the unit is, not on the object the set holds.
  const found = [...units].some((member) => isSameUnitInstance(member, unit));
  return found;
}
