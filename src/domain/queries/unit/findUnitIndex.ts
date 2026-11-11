import type { UnitInstance } from '@entities';
import { isSameUnitInstance } from './unitEquivalence';

/**
 * Where a unit stands in a list of units or of units with their placements,
 * by who it is rather than by reference.
 *
 * @param members - The list to search, each holding its unit
 * @param unit - The unit to find
 * @returns Its position in the list, or `undefined` when it is not there
 */
export function findUnitIndex(
  members: readonly { unit: UnitInstance }[],
  unit: UnitInstance,
): number | undefined {
  const index = members.findIndex((member) =>
    isSameUnitInstance(member.unit, unit),
  );
  return index === -1 ? undefined : index;
}
