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
      return true;
    }
    case 'trait': {
      const traits = restrictions.traitRestrictions;
      const noUnitTypes: string[] = [];
      const matched = matchesUnitRequirements(unitType, traits, noUnitTypes);
      const result = matched.result;
      return result;
    }
    case 'unitType': {
      const noTraits: Trait[] = [];
      const unitTypeIds = restrictions.unitRestrictions;
      const matched = matchesUnitRequirements(unitType, noTraits, unitTypeIds);
      const result = matched.result;
      return result;
    }
    default: {
      const unreachable: never = restrictions;
      return unreachable;
    }
  }
}
