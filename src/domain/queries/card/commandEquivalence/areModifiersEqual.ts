import type { Modifier } from '@entities';

/**
 * Compares two Modifier objects for equivalence (not reference equality) by comparing all properties.
 * Current use case is to find a matching command to remove from pending on issue.
 *
 * @param modifier1 - First modifier object
 * @param modifier2 - Second modifier object
 * @returns Whether the two modifiers have the same type and value
 */
export function areModifiersEqual(
  modifier1: Modifier,
  modifier2: Modifier,
): boolean {
  // Different types cannot be the same modifier
  if (modifier1.type !== modifier2.type) {
    return false;
  }
  // Same type with a different value cannot match
  if (modifier1.value !== modifier2.value) {
    return false;
  }

  // All checks passed, so we return true.
  return true;
}
