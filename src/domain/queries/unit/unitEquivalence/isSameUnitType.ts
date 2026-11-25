import type { UnitInstance } from '@entities';

/**
 * Whether two unit instances have the same unit type.
 *
 * @param unit1 - The first unit instance
 * @param unit2 - The second unit instance
 * @returns True if both units have the same unitType
 */
export function isSameUnitType(
  unit1: UnitInstance,
  unit2: UnitInstance,
): boolean {
  // The type is named by its id, so two copies of the type's record agree.
  const same = unit1.unitType.id === unit2.unitType.id;
  return same;
}
