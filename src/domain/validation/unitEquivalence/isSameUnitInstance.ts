import type { UnitInstance, ValidationResult } from '@entities';
import { areSameSide } from '@entities';
import { isSameInstanceNumber } from './isSameInstanceNumber';
import { isSameUnitType } from './isSameUnitType';

/**
 * Determines whether two unit instances are the same unit.
 * Units are compared by value (playerSide, unitType, instanceNumber), not referential identity.
 *
 * @param unit1 - The first unit instance
 * @param unit2 - The second unit instance
 * @returns True if both units have the same playerSide, unitType, and instanceNumber, false otherwise
 */
export function isSameUnitInstance(
  unit1: UnitInstance,
  unit2: UnitInstance,
): ValidationResult {
  try {
    const sameSide = areSameSide(unit1, unit2);
    const { result: sameUnitType } = isSameUnitType(unit1, unit2);
    const { result: sameInstanceNumber } = isSameInstanceNumber(unit1, unit2);
    if (!sameSide || !sameUnitType || !sameInstanceNumber) {
      return {
        result: false,
        errorReason: 'Units are not the same instance',
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
