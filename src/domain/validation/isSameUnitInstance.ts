import type { UnitInstance } from '@entities';
import { areSameSide } from '@queries';
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
): boolean {
  try {
    return (
      areSameSide(unit1, unit2) &&
      isSameUnitType(unit1, unit2) &&
      isSameInstanceNumber(unit1, unit2)
    );
  } catch {
    return false;
  }
}
