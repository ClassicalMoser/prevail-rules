import type { Restrictions } from '@entities';
import { haveSameMembers } from '@utils';

/**
 * Compares two Restrictions objects for equivalence (not reference equality) by comparing all properties.
 * Current use case is to find a matching command to remove from pending on issue.
 *
 * TODO(misleading): the use case above is gone. The callers are now
 * `areCommandsEqual` and `isSameCardValue`, comparing a card's command and
 * round effect to refuse a forged card. Settle by restating the use.
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

  // Named now, so a fault below can say which kind it met.
  const { restrictionType } = restrictions1;
  switch (restrictions1.restrictionType) {
    case 'none': {
      // With no filter and the same range, the two reach the same units.
      return true;
    }
    case 'trait': {
      // Never true: the two types were compared above. The check narrows
      // `restrictions2` for the compiler, so no case can run its return.
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
      // Never true, as for traits: it narrows `restrictions2`, nothing more.
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
    // Every restriction type is handled above, and the compiler checks it;
    // a restriction of no kind the rules name is a fault in the card.
    default: {
      const _exhaustive: never = restrictions1;
      throw new Error(`Unknown restriction type: ${String(restrictionType)}`);
    }
  }
}
