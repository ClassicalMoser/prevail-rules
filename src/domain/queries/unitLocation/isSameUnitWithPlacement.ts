import type { UnitWithPlacement } from '@entities';
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
 * @returns True when both the unit and its placement match
 */
export function isSameUnitWithPlacement(
  a: UnitWithPlacement,
  b: UnitWithPlacement,
): boolean {
  // Who it is (side, type and instance number), and where it stands and
  // which way it faces.
  const same =
    isSameUnitInstance(a.unit, b.unit) &&
    isSamePlacement(a.placement, b.placement);
  return same;
}
