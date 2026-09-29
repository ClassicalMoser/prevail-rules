import type { Modifier } from '@entities';
import { areModifiersEqual } from './areModifiersEqual';

/**
 * Compares two arrays of Modifiers for equivalence (not reference equality) by comparing all properties.
 * Current use case is to find a matching command to remove from pending on issue.
 * Order does not matter.
 *
 * @param modifiers1 - First modifiers array
 * @param modifiers2 - Second modifiers array
 * @returns Whether the two arrays contain the same modifiers
 */
export function areModifiersArraysEqual(
  modifiers1: Modifier[],
  modifiers2: Modifier[],
): boolean {
  // Different lengths cannot be the same modifiers
  if (modifiers1.length !== modifiers2.length) {
    return false;
  }
  // Copy the second array so each match can be taken out of it
  const remaining = [...modifiers2];
  for (const modifier of modifiers1) {
    // Same type and value counts as a match, whatever the order
    const matchIndex = remaining.findIndex((candidate) =>
      areModifiersEqual(modifier, candidate),
    );
    // No remaining modifier of this type and value
    if (matchIndex === -1) {
      return false;
    }
    // Take that match, so a repeated modifier needs its own copy
    remaining.splice(matchIndex, 1);
  }

  // All checks passed, so we return true.
  return true;
}
