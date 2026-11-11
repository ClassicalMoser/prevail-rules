import type { UnitInstance } from '@entities';
import { isSameInstanceNumber } from './isSameInstanceNumber';
import { isSameUnitType } from './isSameUnitType';
import { isFriendlyUnit } from '../isFriendlyUnit';

/**
 * Whether two unit instances are the same unit. Units are compared by value
 * (playerSide, unitType, instanceNumber), not referential identity.
 *
 * @param unit1 - The first unit instance
 * @param unit2 - The second unit instance
 * @returns True if both units have the same playerSide, unitType, and instanceNumber
 */
export function isSameUnitInstance(
  unit1: UnitInstance,
  unit2: UnitInstance,
): boolean {
  // Same instance only if both fight for the same side.
  const sameSide = isFriendlyUnit(unit1, unit2.playerSide);
  const same =
    sameSide &&
    isSameUnitType(unit1, unit2) &&
    isSameInstanceNumber(unit1, unit2);
  return same;
}
