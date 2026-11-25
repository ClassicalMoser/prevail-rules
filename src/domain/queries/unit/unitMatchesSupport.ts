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
  // Named now, so a fault below can say which kind it met.
  const { supportType } = support;
  switch (support.supportType) {
    case 'generic': {
      // A generic place holds any unit at all (§10.4.2).
      return true;
    }
    case 'trait': {
      // A trait place holds a unit of that trait, such as Punic Citizen
      // Spearmen in a formation or a phalanx stack (§10.4.4).
      return unit.unitType.traits.includes(support.trait);
    }
    case 'unitType': {
      // A unit-type place holds that one unit type.
      return unit.unitType.id === support.unitTypeId;
    }
    // Every kind of unit support is handled above, and the compiler checks
    // it; a support of no kind the rules name is a fault in the card.
    default: {
      const _exhaustive: never = support;
      throw new Error(`Unknown unit support type: ${String(supportType)}`);
    }
  }
}
