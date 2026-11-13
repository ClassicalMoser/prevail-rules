import type { Literal } from './literal';

/**
 * Whether two lists hold the same members, each as many times, in any order.
 * A list of traits or of stats is a set of facts about a card, not a
 * sequence, so the order it was written in does not matter; a repeated
 * member does, since each copy counts.
 *
 * Literals are compared by `===`. Anything else must say what makes two
 * members the same, since two objects with equal contents are never `===`.
 *
 * @param left - The first list
 * @param right - The second list
 * @param isSame - When two members are the same; required for non-literals
 * @returns True when every member of each appears in the other as many times
 */
// Literal members are compared with `===`.
export function haveSameMembers<T extends Literal>(
  left: readonly T[],
  right: readonly T[],
): boolean;
// Object members need their own comparison, since equal objects are not `===`.
export function haveSameMembers<T>(
  left: readonly T[],
  right: readonly T[],
  isSame: (a: T, b: T) => boolean,
): boolean;
export function haveSameMembers<T>(
  left: readonly T[],
  right: readonly T[],
  isSame: (a: T, b: T) => boolean = (a, b) => a === b,
): boolean {
  // Different lengths cannot be the same members.
  if (left.length !== right.length) {
    return false;
  }

  // Copy the second list so each match can be taken out of it.
  const remaining = [...right];
  for (const item of left) {
    const matchIndex = remaining.findIndex((candidate) =>
      isSame(item, candidate),
    );

    // No remaining copy of this member.
    if (matchIndex === -1) {
      return false;
    }

    // Take that match, so a repeated member needs its own copy.
    remaining.splice(matchIndex, 1);
  }

  // Every member found its own copy.
  return true;
}
