import type { UnitInstance, UnitSupport } from '@entities';

/**
 * Whether a unit instance is eligible for a card’s unit-support grant.
 */
export function unitMatchesSupport(
  unit: UnitInstance,
  support: UnitSupport,
): boolean {
  switch (support.supportType) {
    case 'generic': {
      return true;
    }
    case 'trait': {
      return unit.unitType.traits.includes(support.trait);
    }
    case 'unitType': {
      return unit.unitType.id === support.unitTypeId;
    }
    default: {
      const _exhaustive: never = support;
      return _exhaustive;
    }
  }
}
