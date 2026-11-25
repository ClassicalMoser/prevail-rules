import type { Restrictions } from '@entities';
import { haveSameMembers } from '@utils';

/**
 * What a restriction's filter names: nothing, a list of traits, or a list of
 * unit types. Two restrictions of one kind compare by these.
 */
function getFilterMembers(restrictions: Restrictions): readonly string[] {
  // Named now, so a fault below can say which kind it met.
  const { restrictionType } = restrictions;
  switch (restrictions.restrictionType) {
    // No filter names nothing.
    case 'none': {
      const nothing: readonly string[] = [];
      return nothing;
    }
    // A trait filter names the traits a unit must have.
    case 'trait': {
      return restrictions.traitRestrictions;
    }
    // A unit-type filter names the types it reaches.
    case 'unitType': {
      return restrictions.unitRestrictions;
    }
    // Every restriction type is handled above, and the compiler checks it;
    // a restriction of no kind the rules name is a fault in the card.
    default: {
      const _exhaustive: never = restrictions;
      throw new Error(`Unknown restriction type: ${String(restrictionType)}`);
    }
  }
}

/**
 * Compares two Restrictions objects for equivalence (not reference equality) by comparing all properties.
 * `areCommandsEqual` and `isSameCardValue` use it to compare a card's command
 * and round effect with the card held, so a forged card is refused.
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
  // The same restriction reaches as far from the commander, or is printed
  // unrestricted on both (§4.2.7).
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

  // Of the same kind, they reach the same units when they name the same
  // traits or the same unit types, in any order.
  const members1 = getFilterMembers(restrictions1);
  const members2 = getFilterMembers(restrictions2);
  const sameFilter = haveSameMembers(members1, members2);
  return sameFilter;
}
