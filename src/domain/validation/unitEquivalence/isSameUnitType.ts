import type { UnitInstance, ValidationResult } from '@entities';

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
): ValidationResult {
  try {
    const sameUnitType = unit1.unitType.id === unit2.unitType.id;
    if (!sameUnitType) {
      return {
        result: false,
        errorReason: 'Units have different unit types',
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
