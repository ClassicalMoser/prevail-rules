import type { UnitInstance, UnitSupport } from '@entities';

/**
 * Whether a unit instance is eligible for a card’s unit-support grant.
 *
 * Generic support matches every unit.
 * Trait support matches when the unit type lists that trait.
 * Unit-type support matches the type id.
 *
 * @param unit - The unit to check
 * @param support - The grant on the card
 * @returns True when the unit fits the grant
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
