import type { UnitSupport } from '@entities';
import { isSameUnitSupportKind } from './isSameUnitSupportKind';

/**
 * Whether two cards grant the same unit support after a rally (§10.4): the
 * same kind of support, to the same trait or unit type where it names one,
 * for the same number of units.
 *
 * @param support1 - The first card's unit support
 * @param support2 - The second card's unit support
 * @returns True when the two grant the same support
 */
export function areUnitSupportsEqual(
  support1: UnitSupport,
  support2: UnitSupport,
): boolean {
  // The same support holds the same number of places …
  const sameCount = support1.count === support2.count;

  // … for the same kind of unit: any unit, one trait, or one unit type.
  const same = sameCount && isSameUnitSupportKind(support1, support2);
  return same;
}
