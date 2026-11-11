import type { UnitInstance } from '@entities';

/**
 * Whether two unit instances have the same instance number.
 *
 * @param unit1 - The first unit instance
 * @param unit2 - The second unit instance
 * @returns True if both units have the same instanceNumber
 */
export function isSameInstanceNumber(
  unit1: UnitInstance,
  unit2: UnitInstance,
): boolean {
  const same = unit1.instanceNumber === unit2.instanceNumber;
  return same;
}
