import type { Restrictions } from '@entities';

/**
 * Compares two Restrictions objects for equivalence (not reference equality) by comparing all properties.
 * Current use case is to find a matching command to remove from pending on issue.
 *
 * @param restrictions1 - First restrictions object
 * @param restrictions2 - Second restrictions object
 * @returns Whether the two restrictions have the same range and the same traits and unit types
 */
export function areRestrictionsEqual(
  restrictions1: Restrictions,
  restrictions2: Restrictions,
): boolean {
  // Helper function to compare two arrays of literals (strings, numbers, booleans, etc.).
  function sameMembers<T>(left: readonly T[], right: readonly T[]): boolean {
    // Different lengths cannot be the same members
    if (left.length !== right.length) {
      return false;
    }
    // Copy the second list so each match can be taken out of it
    const remaining = [...right];
    for (const item of left) {
      const matchIndex = remaining.indexOf(item);
      // No remaining copy of this member
      if (matchIndex === -1) {
        return false;
      }
      // Take that match, so a repeated member needs its own copy
      remaining.splice(matchIndex, 1);
    }
    return true;
  }

  // Compare inspirationRangeRestriction
  if (
    restrictions1.inspirationRangeRestriction !==
    restrictions2.inspirationRangeRestriction
  ) {
    // Does not match, so we end here.
    return false;
  }

  // Compare traitRestrictions. Order does not matter.
  if (
    !sameMembers(
      restrictions1.traitRestrictions,
      restrictions2.traitRestrictions,
    )
  ) {
    // Does not match, so we end here.
    return false;
  }

  // Compare unitRestrictions. Order does not matter.
  if (
    !sameMembers(restrictions1.unitRestrictions, restrictions2.unitRestrictions)
  ) {
    // Does not match, so we end here.
    return false;
  }
  // All checks passed, so we return true.
  return true;
}
