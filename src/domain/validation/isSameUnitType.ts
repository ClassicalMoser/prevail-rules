import type { UnitInstance } from '@entities';

/**
 * Determines whether two unit instances have the same unit type.
 *
 * @param unit1 - The first unit instance
 * @param unit2 - The second unit instance
 * @returns True if both units have the same unitType, false otherwise
 */
export function isSameUnitType(
  unit1: UnitInstance,
  unit2: UnitInstance,
): boolean {
  try {
    return unit1.unitType === unit2.unitType;
  } catch {
    return false;
  }
}

