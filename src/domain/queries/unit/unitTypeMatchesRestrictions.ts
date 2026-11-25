import type { Restrictions, UnitType } from '@entities';
import type { Trait } from '@ruleValues';

import { matchesUnitRequirements } from './matchesUnitRequirements';

/**
 * Whether a unit type satisfies a command or round-effect restriction's
 * trait or unit-type filter. Inspiration range is not part of this check.
 *
 * @param unitType - The unit type to check
 * @param restrictions - The restriction, which carries at most one of the two filters
 * @returns True when the filter is absent or the unit type satisfies it
 */
export function unitTypeMatchesRestrictions(
  unitType: UnitType,
  restrictions: Restrictions,
): boolean {
  switch (restrictions.restrictionType) {
    case 'none': {
      // An order or round effect printed without a filter reaches any type.
      const unrestricted = true;
      return unrestricted;
    }
    case 'trait': {
      // The unit must have every listed trait (§4.3.4).
      const traits = restrictions.traitRestrictions;
      const noUnitTypes: string[] = [];
      const matched = matchesUnitRequirements(unitType, traits, noUnitTypes);
      return matched;
    }
    case 'unitType': {
      // The unit must be one of the listed types (§4.3.4).
      const noTraits: Trait[] = [];
      const unitTypeIds = restrictions.unitRestrictions;
      const matched = matchesUnitRequirements(unitType, noTraits, unitTypeIds);
      return matched;
    }
    default: {
      // Never reached: every restriction type is handled above, and the
      // compiler checks it. No case can run this line.
      const unreachable: never = restrictions;
      return unreachable;
    }
  }
}
