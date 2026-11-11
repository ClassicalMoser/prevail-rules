import type { Restrictions } from '@entities';
import { haveSameMembers } from '@utils';

/**
 * Compares two Restrictions objects for equivalence (not reference equality) by comparing all properties.
 * Current use case is to find a matching command to remove from pending on issue.
 *
 * @param restrictions1 - First restrictions object
 * @param restrictions2 - Second restrictions object
 * @returns Whether the two restrictions have the same range and the same filter
 */
export function areRestrictionsEqual(
  restrictions1: Restrictions,
  restrictions2: Restrictions,
): boolean {
  // Compare inspirationRangeRestriction
  if (
    restrictions1.inspirationRangeRestriction !==
    restrictions2.inspirationRangeRestriction
  ) {
    // Does not match, so we end here.
    return false;
  }

  // A trait filter is not the same restriction as a unit-type filter.
  if (restrictions1.restrictionType !== restrictions2.restrictionType) {
    return false;
  }

  switch (restrictions1.restrictionType) {
    case 'none': {
      return true;
    }
    case 'trait': {
      if (restrictions2.restrictionType !== 'trait') {
        return false;
      }
      // Compare traitRestrictions. Order does not matter.
      const sameTraits = haveSameMembers(
        restrictions1.traitRestrictions,
        restrictions2.traitRestrictions,
      );
      return sameTraits;
    }
    case 'unitType': {
      if (restrictions2.restrictionType !== 'unitType') {
        return false;
      }
      // Compare unitRestrictions. Order does not matter.
      const sameUnits = haveSameMembers(
        restrictions1.unitRestrictions,
        restrictions2.unitRestrictions,
      );
      return sameUnits;
    }
    default: {
      const unreachable: never = restrictions1;
      return unreachable;
    }
  }
}
