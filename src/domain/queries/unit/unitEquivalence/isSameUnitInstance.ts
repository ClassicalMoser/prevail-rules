import type { UnitInstance } from '@entities';
import type { ValidationResult } from '@utils';
import { isSameInstanceNumber } from './isSameInstanceNumber';
import { isSameUnitType } from './isSameUnitType';
import { isFriendlyUnit } from '../isFriendlyUnit';

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
  // Same instance only if both fight for the same side.
  const sameSide = isFriendlyUnit(unit1, unit2.playerSide);
  const { result: sameUnitType } = isSameUnitType(unit1, unit2);
  const { result: sameInstanceNumber } = isSameInstanceNumber(unit1, unit2);
  if (!sameSide || !sameUnitType || !sameInstanceNumber) {
    return {
      errorReason: 'Units are not the same instance',
      result: false,
    };
  }
  return {
    result: true,
  };
}
