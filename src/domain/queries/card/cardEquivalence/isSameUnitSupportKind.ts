import type { UnitSupport } from '@entities';

/**
 * Whether two unit supports name the same kind of unit: any unit, the same
 * trait, or the same unit type, whatever number of places each holds. Cards
 * that name the same thing stack into one stack of places after a rally
 * (§10.4.3); cards that name different things stay separate.
 *
 * @param support1 - One card's or stack's unit support
 * @param support2 - The other
 * @returns True when both name the same kind of unit
 */
export function isSameUnitSupportKind(
  support1: UnitSupport,
  support2: UnitSupport,
): boolean {
  switch (support1.supportType) {
    case 'generic': {
      // Generic support holds any unit at all, so every generic card stacks.
      const same = support2.supportType === 'generic';
      return same;
    }
    case 'trait': {
      // Trait support stacks only with support for that same trait: a
      // phalanx stack and a formation stack are two stacks.
      const same =
        support2.supportType === 'trait' && support1.trait === support2.trait;
      return same;
    }
    case 'unitType': {
      // Unit-type support stacks only with support naming that same type.
      const same =
        support2.supportType === 'unitType' &&
        support1.unitTypeId === support2.unitTypeId;
      return same;
    }
    default: {
      const unreachable: never = support1;
      return unreachable;
    }
  }
}
