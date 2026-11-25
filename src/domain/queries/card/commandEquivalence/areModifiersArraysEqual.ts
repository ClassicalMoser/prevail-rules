import type { Modifier } from '@entities';
import { haveSameMembers } from '@utils';
import { areModifiersEqual } from './areModifiersEqual';

/**
 * Compares two arrays of Modifiers for equivalence (not reference equality) by comparing all properties.
 * Current use case is to find a matching command to remove from pending on issue.
 * Order does not matter.
 *
 * TODO(misleading): the use case above is gone. The callers are now
 * `areCommandsEqual` and `isSameCardValue`, which refuse a forged card's
 * command or round effect. Settle by restating the use in those terms.
 *
 * @param modifiers1 - First modifiers array
 * @param modifiers2 - Second modifiers array
 * @returns Whether the two arrays contain the same modifiers
 */
export function areModifiersArraysEqual(
  modifiers1: Modifier[],
  modifiers2: Modifier[],
): boolean {
  // Same type and value counts as a match, whatever the order, and a
  // repeated modifier needs its own copy.
  const sameModifiers = haveSameMembers(
    modifiers1,
    modifiers2,
    areModifiersEqual,
  );
  return sameModifiers;
}
