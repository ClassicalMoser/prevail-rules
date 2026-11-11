import type { UnitSupport } from '@entities';

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
  if (support1.count !== support2.count) {
    return false;
  }
  switch (support1.supportType) {
    case 'generic': {
      return support2.supportType === 'generic';
    }
    case 'trait': {
      return (
        support2.supportType === 'trait' && support1.trait === support2.trait
      );
    }
    case 'unitType': {
      return (
        support2.supportType === 'unitType' &&
        support1.unitTypeId === support2.unitTypeId
      );
    }
    default: {
      const unreachable: never = support1;
      return unreachable;
    }
  }
}
