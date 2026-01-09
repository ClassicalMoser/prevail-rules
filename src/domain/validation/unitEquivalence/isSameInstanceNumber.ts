import type { UnitInstance, ValidationResult } from '@entities';

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
): ValidationResult {
  try {
    const sameInstanceNumber = unit1.instanceNumber === unit2.instanceNumber;
    if (!sameInstanceNumber) {
      return {
        result: false,
        errorReason: 'Units have different instance numbers',
      };
    }
    return {
      result: true,
    };
  } catch (error) {
    return {
      result: false,
      errorReason: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
