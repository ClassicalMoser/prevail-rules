import type { UnitWithPlacement } from '@entities';
import type { ValidationResult } from '@utils';
import { isSameUnitInstance } from '../unit/unitEquivalence';
import { isSamePlacement } from './isSamePlacement';

/**
 * Whether two units-with-placements are the same unit standing the same
 * way on the same space. A choice names the unit it acts with by where it
 * stands as well as who it is, and a validator matches that against the
 * units the rules offer: the same unit placed differently is a stale or
 * forged choice, not the offered one.
 *
 * @param a - One unit and where it stands
 * @param b - The other unit and where it stands
 * @returns Success when both the unit and its placement match; otherwise the reason they differ
 */
export function isSameUnitWithPlacement(
  a: UnitWithPlacement,
  b: UnitWithPlacement,
): ValidationResult {
  // Who it is: side, type and instance number (`isSameUnitInstance`).
  const sameUnit = isSameUnitInstance(a.unit, b.unit);
  if (!sameUnit.result) {
    return sameUnit;
  }
  // Where it stands, and which way it faces.
  if (!isSamePlacement(a.placement, b.placement)) {
    const differentPlacement: ValidationResult = {
      errorReason: 'The same unit, placed differently',
      result: false,
    };
    return differentPlacement;
  }
  const same: ValidationResult = { result: true };
  return same;
}
