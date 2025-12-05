import type { UnitInstance } from '@entities';

/**
 * Determines whether two unit instances have the same instance number.
 *
 * @param unit1 - The first unit instance
 * @param unit2 - The second unit instance
 * @returns True if both units have the same instanceNumber, false otherwise
 */
export function isSameInstanceNumber(
  unit1: UnitInstance,
  unit2: UnitInstance,
): boolean {
  try {
    return unit1.instanceNumber === unit2.instanceNumber;
  } catch {
    return false;
  }
}

